import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

type ImportJob = {
  id: string
  user_id: string
  status: string
  raw_text: string
  raw_pages?: unknown
  total_pages?: number | null
  next_page?: number | null
  completed_pages?: number | null
  total_tokens_used?: number | null
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS })

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Auth user
    const authHeader = req.headers.get("Authorization") ?? ""
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser()

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const body = await req.json().catch(() => null)
    const jobId = body?.jobId as string | undefined

    if (!jobId) {
      return new Response(JSON.stringify({ error: "Missing jobId" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Load job
    const { data: job, error: jobErr2 } = await adminClient
      .from("question_imports")
      .select("id,user_id,status,raw_text,raw_pages,total_pages,next_page,completed_pages,total_tokens_used")
      .eq("id", jobId)
      .single()

    if (jobErr2 || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const importJob = job as ImportJob

    if (importJob.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Validate raw_text exists
    const rawText = (importJob.raw_text ?? "").trim()
    if (!rawText) {
      return new Response(JSON.stringify({ error: "Job has empty raw_text" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Idempotent responses (safe to call multiple times)
    if (importJob.status === "ready") {
      return new Response(JSON.stringify({ ok: true, jobId, status: "ready", done: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }
    if (importJob.status === "processing") {
      return new Response(JSON.stringify({ ok: true, jobId, status: "processing", done: false }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Determine mode
    const pages = Array.isArray(importJob.raw_pages) ? (importJob.raw_pages as unknown[]) : null
    const totalPages = pages?.length ?? null
    const mode = totalPages && totalPages > 0 ? "page_by_page" : "single_chunk"

    // Enqueue job (FAST). Initialize progress if pages exist.
    const nowIso = new Date().toISOString()
    const updatePayload: Record<string, unknown> = {
      status: "queued",
      locked_at: null,
      locked_by: null,
      updated_at: nowIso,
      // you can also clear last_error here if you have a column for it
    }

    if (mode === "page_by_page") {
      updatePayload.total_pages = totalPages
      updatePayload.next_page = 0
      updatePayload.completed_pages = 0
      updatePayload.total_tokens_used = importJob.total_tokens_used ?? 0
    } else {
      // single chunk mode: still init basic progress
      updatePayload.total_pages = 1
      updatePayload.next_page = 0
      updatePayload.completed_pages = 0
      updatePayload.total_tokens_used = importJob.total_tokens_used ?? 0
    }

    const { error: updErr } = await adminClient.from("question_imports").update(updatePayload).eq("id", jobId)

    if (updErr) {
      return new Response(JSON.stringify({ error: `Failed to enqueue job: ${updErr.message}` }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Respond quickly: 202 Accepted
    return new Response(
      JSON.stringify({
        ok: true,
        jobId,
        status: "queued",
        mode,
        total_pages: updatePayload.total_pages,
        next_page: 0,
      }),
      { status: 202, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }
})
