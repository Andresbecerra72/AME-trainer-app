import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"
// -------------------------
// CORS Headers
// -------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En producción, cámbialo por tu dominio real
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

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
  raw_text: string | null
}

// -------------------------
// Simple heuristic parser (Phase 1)
// -------------------------
function parseQuestionsFromText(raw: string): DraftQuestion[] {
  const text = raw.replace(/\r\n/g, "\n").trim()
  if (!text) return []

  // Split by double line breaks or more (questions are separated by blank lines)
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  console.log(`Found ${blocks.length} blocks to parse`)
  
  const out: DraftQuestion[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    console.log(`\n--- Parsing block ${i + 1} ---`)
    console.log('Block content:', block.substring(0, 200))
    
    // Try Format 1: Multiple choice with options (Q: ... A) B) C) D) Answer:)
    const mcResult = parseMultipleChoice(block)
    if (mcResult) {
      console.log('✓ Parsed as multiple choice')
      out.push(mcResult)
      continue
    }
    
    // Try Format 2: Direct answer question (e.g., "3- Question? Answer text.")
    const directResult = parseDirectAnswer(block)
    if (directResult) {
      console.log('✓ Parsed as direct answer')
      out.push(directResult)
      continue
    }
    
    console.log('✗ Could not parse block')
  }

  return out
}

// Parse multiple choice format: Q: ... A) ... B) ... C) ... D) ... Answer: X
function parseMultipleChoice(block: string): DraftQuestion | null {
  // More flexible regex patterns that handle extra spaces and line breaks
  const q = block.match(/^(?:\d+[\s\-\.]*)?(?:Q\s*:|Question\s*:)?\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const a = block.match(/^\s*(?:A\s*\)|A\s*\.|A\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const b = block.match(/^\s*(?:B\s*\)|B\s*\.|B\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const c = block.match(/^\s*(?:C\s*\)|C\s*\.|C\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const d = block.match(/^\s*(?:D\s*\)|D\s*\.|D\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const ans = block.match(/(?:Answer\s*:|Correct\s*:)\s*([ABCD])\b/im)?.[1]?.toUpperCase() as
    | "A"
    | "B"
    | "C"
    | "D"
    | undefined

  // Need at least question and all 4 options
  if (!q || !a || !b || !c || !d) {
    return null
  }

  return {
    question_text: q,
    option_a: a,
    option_b: b,
    option_c: c,
    option_d: d,
    correct_answer: ans ?? null,
    confidence: ans ? 0.85 : 0.55,
  }
}

// Parse direct answer format: "3- Question? Answer text."
function parseDirectAnswer(block: string): DraftQuestion | null {
  // Extract question (ends with ?)
  const questionMatch = block.match(/^(?:\d+[\s\-\.]*)?(.+?\?)/im)
  if (!questionMatch) return null
  
  const question = questionMatch[1].trim()
  
  // Extract answer (everything after the question mark, cleaned up)
  const remainingText = block.substring(questionMatch[0].length).trim()
  if (!remainingText) return null
  
  // Clean up the answer text
  const answer = remainingText
    .replace(/^[\s\-\.,:;]+/, '') // Remove leading punctuation
    .replace(/[\s\.]+$/, '')      // Remove trailing punctuation
    .trim()
  
  if (!answer || answer.length < 2) return null
  
  return {
    question_text: question,
    option_a: answer,
    option_b: '---',
    option_c: '---',
    option_d: '---',
    correct_answer: 'A',
    confidence: 0.70, // Lower confidence for direct answers
  }
}

// -------------------------
// PDF text extraction - SIMPLIFIED for Edge Functions
// Note: pdfjs-dist requires Node.js canvas which doesn't work in Deno
// Phase 2: Use external API or client-side extraction
// -------------------------
async function extractPdfText(pdfBytes: Uint8Array): Promise<string> {
  // For now, we'll return a clear error message
  // TODO: Implement using:
  // - Client-side extraction (pdfjs in browser)
  // - External API (PDF.co, Adobe PDF Services)
  // - Or Cloudflare Workers AI
  throw new Error(
    "PDF text extraction in Edge Functions is not yet implemented. " +
    "Please extract text on client-side using pdf.js and send raw_text directly, " +
    "or wait for Phase 2 implementation with external PDF API."
  )
}

// -------------------------
// Handler
// -------------------------
Deno.serve(async (req: Request) => {
  console.log("AQUI")
   // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  try {
    console.log("parse-import-job function invoked")
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!

    if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
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
      return new Response(JSON.stringify({ error: "Unauthorized" }),
       { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const body = await req.json().catch(() => null)
    const jobId = body?.jobId as string | undefined
    if (!jobId) {
      return new Response(JSON.stringify({ error: "Missing jobId" }),
       { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // 2) Service client for Storage + DB updates
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Load job
    const { data: job, error: jobError } = await adminClient
      .from("question_imports")
      .select("id,user_id,file_path,file_mime,status,raw_text")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }),
       { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const j = job as ImportJob

    // Only owner can trigger, OR admin roles (optional)
    // Here: owner only (simpler). If you want admin access, we can add role check.
    if (j.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }),
       { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } })
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

      return new Response(JSON.stringify({ error: "Failed to download file" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const mime = j.file_mime ?? ""
    const bytes = new Uint8Array(await fileData.arrayBuffer())

    let rawText = ""
    
    // Check if raw_text is already provided in the job
    // (extracted on client-side)
    if (j.raw_text) {
      console.log(`Using pre-extracted raw_text: ${j.raw_text.length} characters`)
      console.log('First 300 chars:', j.raw_text.substring(0, 300))
      rawText = j.raw_text
    } else if (mime.includes("pdf") || j.file_path.toLowerCase().endsWith(".pdf")) {
      // PDF parsing not available in Edge Functions yet
      throw new Error(
        "PDF parsing requires client-side extraction. " +
        "Use pdf.js in the browser to extract text before uploading."
      )
    } else if (mime.includes("text/plain")) {
      // Plain text files can be read directly
      rawText = new TextDecoder().decode(bytes)
    } else if (mime.startsWith("image/")) {
      // Phase 2: OCR (recommended)
      throw new Error("Image OCR not implemented yet. Phase 2 will add OCR + AI parsing.")
    } else {
      throw new Error(`Unsupported file type: ${mime || "unknown"}`)
    }

    const drafts = parseQuestionsFromText(rawText)
    console.log(`Parser found ${drafts.length} questions`)
    if (drafts.length > 0) {
      console.log('First question:', JSON.stringify(drafts[0], null, 2))
    }
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

    return new Response(JSON.stringify({ ok: true, jobId, detected: drafts.length }),
     { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({ error: msg }),
     { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})
