// <reference types="https://deno.land/x/types/index.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

// -------------------------
// Types
// -------------------------
type DraftQuestion = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D" | null
  explanation?: string
  confidence?: number
}

type ImportJob = {
  id: string
  user_id: string
  file_path: string
  file_mime: string | null
  status: string
}

// -------------------------
// Simple heuristic parser (Phase 1)
// -------------------------
function parseQuestionsFromText(raw: string): DraftQuestion[] {
  const text = raw.replace(/\r\n/g, "\n").trim()
  if (!text) return []

  const blocks = text.split(/\n{2,}/g).map((b) => b.trim()).filter(Boolean)
  const out: DraftQuestion[] = []

  for (const block of blocks) {
    const q = block.match(/^(?:Q:|Question:)\s*(.+)$/m)?.[1]?.trim()
    const a = block.match(/^(?:A\)|A\.|A:)\s*(.+)$/m)?.[1]?.trim()
    const b = block.match(/^(?:B\)|B\.|B:)\s*(.+)$/m)?.[1]?.trim()
    const c = block.match(/^(?:C\)|C\.|C:)\s*(.+)$/m)?.[1]?.trim()
    const d = block.match(/^(?:D\)|D\.|D:)\s*(.+)$/m)?.[1]?.trim()
    const ans = block.match(/^(?:Answer:|Correct:)\s*([ABCD])\b/m)?.[1] as
      | "A"
      | "B"
      | "C"
      | "D"
      | undefined

    if (!q || !a || !b || !c || !d) continue

    out.push({
      question_text: q,
      option_a: a,
      option_b: b,
      option_c: c,
      option_d: d,
      correct_answer: ans ?? null,
      confidence: ans ? 0.85 : 0.55,
    })
  }

  return out
}

// -------------------------
// PDF text extraction (pdfjs-dist via esm.sh)
// -------------------------
async function extractPdfText(pdfBytes: Uint8Array): Promise<string> {
  const pdfjsLib = await import("https://esm.sh/pdfjs-dist@4.6.82/legacy/build/pdf.mjs")

  // pdfjs in Deno needs a worker disabled
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = ""

  const loadingTask = (pdfjsLib as any).getDocument({ data: pdfBytes })
  const pdf = await loadingTask.promise

  const texts: string[] = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items.map((it: any) => it.str).join(" ")
    texts.push(pageText)
  }

  return texts.join("\n\n")
}

// -------------------------
// Handler
// -------------------------
Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!

    if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), { status: 500 })
    }

    // 1) Authenticated caller (uses user token)
    const authHeader = req.headers.get("Authorization") ?? ""
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser()

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const jobId = body?.jobId as string | undefined
    if (!jobId) {
      return new Response(JSON.stringify({ error: "Missing jobId" }), { status: 400 })
    }

    // 2) Service client for Storage + DB updates
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Load job
    const { data: job, error: jobError } = await adminClient
      .from("question_imports")
      .select("id,user_id,file_path,file_mime,status")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 })
    }

    const j = job as ImportJob

    // Only owner can trigger, OR admin roles (optional)
    // Here: owner only (simpler). If you want admin access, we can add role check.
    if (j.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    }

    // Mark processing
    await adminClient
      .from("question_imports")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId)

    // Download from Storage
    // file_path must be like: userId/jobId/filename.pdf
    const bucket = "question-imports"
    const { data: fileData, error: dlErr } = await adminClient.storage
      .from(bucket)
      .download(j.file_path)

    if (dlErr || !fileData) {
      await adminClient
        .from("question_imports")
        .update({ status: "failed", error: dlErr?.message ?? "Download failed" })
        .eq("id", jobId)

      return new Response(JSON.stringify({ error: "Failed to download file" }), { status: 500 })
    }

    const mime = j.file_mime ?? ""
    const bytes = new Uint8Array(await fileData.arrayBuffer())

    let rawText = ""
    if (mime.includes("pdf") || j.file_path.toLowerCase().endsWith(".pdf")) {
      rawText = await extractPdfText(bytes)
    } else if (mime.startsWith("image/")) {
      // Phase 2: OCR (recommended)
      // For now fail gracefully with a clear message.
      throw new Error("Image OCR not implemented yet. Phase 2 will add OCR + AI parsing.")
    } else {
      throw new Error(`Unsupported file type: ${mime || "unknown"}`)
    }

    const drafts = parseQuestionsFromText(rawText)
    const stats = {
      detected: drafts.length,
      type: mime.includes("pdf") ? "pdf" : "image",
      parser: "heuristic_v1",
    }

    await adminClient
      .from("question_imports")
      .update({
        status: "ready",
        raw_text: rawText,
        result: drafts,
        stats,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    return new Response(JSON.stringify({ ok: true, jobId, detected: drafts.length }), { status: 200 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
})
