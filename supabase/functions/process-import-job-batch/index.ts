import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Tune these safely
const BATCH_PAGES = 2            // reduced to 2 to avoid timeouts
const MAX_WALL_MS = 110_000      // increased to 110s for safer margin

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
  status: string
  raw_text: string
  raw_pages?: unknown
  result?: unknown
  total_pages?: number | null
  next_page?: number | null
  completed_pages?: number | null
  total_tokens_used?: number | null
  locked_at?: string | null
  locked_by?: string | null
  stats?: {
    warnings?: Array<{ page: number; type: string; message: string }>
    failed_pages?: number[]
    successful_pages?: number[]
  } | null
}

function getOpenAIPrompt(): string {
  return `
**CRITICAL: Extract ALL questions from the complete document.**

You are an expert at extracting exam questions from any format. Your task is to identify and structure EVERY question you find.

IMPORTANT: Questions can come in MANY different formats:
- With numbering: "1. Question?" or "1) Question?" or "Q1: Question?"
- With labeled options: A) B) C) D) or a) b) c) d) or A. B. C. D.
- Without clear labels but with multiple listed options
- Answers at the end: "Answer: A" or "Correct: A" or "R: A"
- Continuous paragraph format

EXAMPLES of formats you MUST recognize:

Format 1 (with clear labels):
1. What is the capital of France?
A) London
B) Paris
C) Madrid
D) Rome
Answer: B

Format 2 (listed options without labels):
What is the capital of France?
London
Paris
Madrid
Rome
Correct: Paris

Format 3 (continuous text):
1. What is the capital of France? a) London b) Paris c) Madrid d) Rome. Answer: b

Format 4 (no explicit answer):
What is the capital of France?
- London
- Paris
- Madrid
- Rome

OUTPUT FORMAT (strict JSON):
{
  "items": [
    {
      "question_text": "What is the capital of France?",
      "option_a": "London",
      "option_b": "Paris",
      "option_c": "Madrid",
      "option_d": "Rome",
      "correct_answer": "B",
      "explanation": "Paris is the capital of France"
    }
  ]
}

MANDATORY RULES:
1. EXTRACT ALL questions - don't stop after a few
2. If options are missing, create them based on context
3. If no explicit correct answer, infer the most logical one (indicate in explanation: "Inferred from context")
4. Maintain original language
5. DO NOT include markdown
6. Ensure correct_answer is a letter: "A", "B", "C" or "D"

The "items" array must contain ALL questions from the complete text.
`.trim()
}

async function callOpenAI(
  apiKey: string,
  text: string,
  pageInfo: { pageNum: number; totalPages: number },
  startedAtMs: number,
): Promise<{ items: DraftQuestion[]; tokensUsed: number; warning?: string }> {
  // Safety: stop if we're running out of time
  if (Date.now() - startedAtMs > MAX_WALL_MS) {
    console.warn(`Skipping OpenAI call for page ${pageInfo.pageNum} - time budget exceeded`)
    return { 
      items: [], 
      tokensUsed: 0, 
      warning: `Wall clock time budget exceeded (>${MAX_WALL_MS}ms)` 
    }
  }

  // Skip empty or very short text
  if (!text || text.trim().length < 50) {
    console.log(`Skipping page ${pageInfo.pageNum} - insufficient text (${text?.length || 0} chars)`)
    return { 
      items: [], 
      tokensUsed: 0, 
      warning: `Insufficient text content (${text?.length || 0} chars)` 
    }
  }

  // Timeout per OpenAI call (important)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000) // increased to 60s

  try {
    const userContent =
      `${getOpenAIPrompt()}\n\n` +
      `Text to process (Page ${pageInfo.pageNum} of ${pageInfo.totalPages}):\n` +
      `"""\n${text}\n"""`

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You extract exam questions and return valid JSON only." },
          { role: "user", content: userContent },
        ],
      }),
    })

    if (!res.ok) {
      const txt = await res.text()
      console.error(`OpenAI API error for page ${pageInfo.pageNum}:`, txt)
      
      // Si es error de rate limit o servidor, no fallar todo el job
      if (res.status === 429 || res.status >= 500) {
        console.warn(`Recoverable OpenAI error (${res.status}), continuing with other pages`)
        return { 
          items: [], 
          tokensUsed: 0, 
          warning: `OpenAI API error (${res.status}): ${res.status === 429 ? 'Rate limit' : 'Server error'}` 
        }
      }
      
      throw new Error(`OpenAI error (${res.status}): ${txt}`)
    }

    const data = await res.json()
    const tokensUsed = data.usage?.total_tokens ?? 0
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      console.warn(`No content from OpenAI for page ${pageInfo.pageNum}`)
      return { 
        items: [], 
        tokensUsed, 
        warning: 'No content received from OpenAI' 
      }
    }

    try {
      const parsed = JSON.parse(content)
      const items = Array.isArray(parsed?.items) ? parsed.items : []
      console.log(`Extracted ${items.length} questions from page ${pageInfo.pageNum}`)
      return { items, tokensUsed }
    } catch (parseError) {
      console.error(`Failed to parse OpenAI response for page ${pageInfo.pageNum}:`, parseError)
      return { 
        items: [], 
        tokensUsed, 
        warning: 'Failed to parse OpenAI JSON response' 
      }
    }
  } catch (fetchError: any) {
    if (fetchError.name === 'AbortError') {
      console.warn(`OpenAI request timeout for page ${pageInfo.pageNum}`)
      return { 
        items: [], 
        tokensUsed: 0, 
        warning: 'OpenAI request timeout (>60s)' 
      }
    }
    throw fetchError
  } finally {
    clearTimeout(timeout)
  }
}

async function lockJob(admin: any, jobId: string, lockId: string) {
  // Simple lock: only lock if locked_at is NULL
  const { data, error } = await admin
    .from("question_imports")
    .update({
      locked_at: new Date().toISOString(),
      locked_by: lockId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .is("locked_at", null)
    .select("id")
    .single()

  if (error) return { locked: false, error }
  return { locked: !!data, error: null }
}

async function unlockJob(admin: any, jobId: string, lockId: string) {
  await admin
    .from("question_imports")
    .update({
      locked_at: null,
      locked_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("locked_by", lockId)
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS })

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  const startedAt = Date.now()

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? ""

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing environment variables" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Auth user (so only owner can run worker)
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

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Load job
    const { data: job, error: jobErr2 } = await admin
      .from("question_imports")
      .select(
        "id,user_id,status,raw_text,raw_pages,result,total_pages,next_page,completed_pages,total_tokens_used,locked_at,locked_by,stats",
      )
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

    // Idempotent terminal states
    if (importJob.status === "ready") {
      return new Response(JSON.stringify({ ok: true, jobId, done: true, status: "ready" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }
    if (importJob.status === "failed") {
      return new Response(JSON.stringify({ ok: false, jobId, done: true, status: "failed" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Lock to avoid concurrent workers
    const lockId = crypto.randomUUID()
    const lock = await lockJob(admin, jobId, lockId)
    if (!lock.locked) {
      return new Response(
        JSON.stringify({
          ok: true,
          jobId,
          done: false,
          status: importJob.status,
          message: "Job is locked by another worker. Try again shortly.",
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      )
    }

    try {
      // Determine mode: page_by_page preferred; fallback single chunk
      const pages = Array.isArray(importJob.raw_pages) ? (importJob.raw_pages as string[]) : null

      const mode = pages && pages.length > 0 ? "page_by_page" : "single_chunk"

      let totalPages = mode === "page_by_page" ? pages!.length : 1
      let nextPage = Math.max(0, importJob.next_page ?? 0)

      // Initialize totals if missing
      if (!importJob.total_pages) {
        await admin
          .from("question_imports")
          .update({ total_pages: totalPages, updated_at: new Date().toISOString() })
          .eq("id", jobId)
      }

      // Ensure status is processing while we work
      if (importJob.status !== "processing") {
        await admin
          .from("question_imports")
          .update({ status: "processing", updated_at: new Date().toISOString() })
          .eq("id", jobId)
      }

      // Guard: if already completed
      if (nextPage >= totalPages) {
        await admin
          .from("question_imports")
          .update({
            status: "ready",
            completed_pages: totalPages,
            next_page: totalPages,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId)

        return new Response(JSON.stringify({ ok: true, jobId, done: true, status: "ready" }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        })
      }

      // Decide batch range
      const endExclusive = Math.min(nextPage + BATCH_PAGES, totalPages)

      // Prepare texts for batch
      const batchTexts: { pageIndex: number; text: string }[] = []
      if (mode === "page_by_page") {
        for (let i = nextPage; i < endExclusive; i++) {
          batchTexts.push({ pageIndex: i, text: pages![i] ?? "" })
        }
      } else {
        // single chunk uses raw_text only once
        batchTexts.push({ pageIndex: 0, text: importJob.raw_text ?? "" })
      }

      // Small controlled concurrency: 1 at a time to avoid cumulative timeouts
      const CONCURRENCY = 1
      const results: { page: number; items: DraftQuestion[]; tokens: number; warning?: string }[] = []

      for (let i = 0; i < batchTexts.length; i += CONCURRENCY) {
        if (Date.now() - startedAt > MAX_WALL_MS) break

        const slice = batchTexts.slice(i, i + CONCURRENCY)

        const sliceResults = await Promise.all(
          slice.map(async (p) => {
            const { items, tokensUsed, warning } = await callOpenAI(
              OPENAI_API_KEY,
              p.text,
              { pageNum: p.pageIndex + 1, totalPages },
              startedAt,
            )
            return { page: p.pageIndex + 1, items, tokens: tokensUsed, warning }
          }),
        )

        results.push(...sliceResults)
      }

      const newQuestions = results.flatMap((r) => r.items)
      const tokensThisBatch = results.reduce((sum, r) => sum + (r.tokens ?? 0), 0)

      // Build warnings and stats
      const failedPages: number[] = []
      const successfulPages: number[] = []
      const newWarnings: Array<{ page: number; type: string; message: string }> = []

      results.forEach((r) => {
        if (r.warning) {
          failedPages.push(r.page)
          newWarnings.push({
            page: r.page,
            type: 'timeout',
            message: r.warning,
          })
          console.warn(`[Page ${r.page}] Warning: ${r.warning}`)
        } else if (r.items.length > 0) {
          successfulPages.push(r.page)
        } else {
          failedPages.push(r.page)
          newWarnings.push({
            page: r.page,
            type: 'no_questions',
            message: 'No questions extracted from this page',
          })
        }
      })

      // Merge into result array (simple approach)
      const existing = Array.isArray(importJob.result) ? (importJob.result as DraftQuestion[]) : []
      const merged = existing.concat(newQuestions)

      // Merge stats with existing ones
      const existingStats = (importJob.stats as any) || {}
      const existingWarnings = Array.isArray(existingStats.warnings) ? existingStats.warnings : []
      const existingFailedPages = Array.isArray(existingStats.failed_pages) ? existingStats.failed_pages : []
      const existingSuccessfulPages = Array.isArray(existingStats.successful_pages) ? existingStats.successful_pages : []

      const updatedStats = {
        warnings: [...existingWarnings, ...newWarnings],
        failed_pages: [...existingFailedPages, ...failedPages],
        successful_pages: [...existingSuccessfulPages, ...successfulPages],
      }

      // Update progress
      const updatedNext = mode === "page_by_page" ? endExclusive : 1
      const done = updatedNext >= totalPages

      // Preparar actualización con logs detallados
      const updatePayload = {
        result: merged,
        next_page: updatedNext,
        completed_pages: updatedNext,
        total_pages: totalPages,
        total_tokens_used: (importJob.total_tokens_used ?? 0) + tokensThisBatch,
        stats: updatedStats,
        status: done ? "ready" : "processing",
        updated_at: new Date().toISOString(),
        error: null, // Limpiar error previo si existe
      }

      console.log(`Updating job ${jobId}:`, {
        status: updatePayload.status,
        progress: `${updatedNext}/${totalPages}`,
        questionsExtracted: merged.length,
        tokensUsed: updatePayload.total_tokens_used
      })

      const { error: updateErr } = await admin
        .from("question_imports")
        .update(updatePayload)
        .eq("id", jobId)

      if (updateErr) {
        console.error(`Failed to update job ${jobId}:`, updateErr)
        throw new Error(`Database update failed: ${updateErr.message}`)
      }

      return new Response(
        JSON.stringify({
          ok: true,
          jobId,
          mode,
          done,
          status: done ? "ready" : "processing",
          processedPages:
            mode === "page_by_page"
              ? Array.from({ length: endExclusive - nextPage }, (_, k) => nextPage + k + 1)
              : [1],
          next_page: updatedNext,
          total_pages: totalPages,
          addedQuestions: newQuestions.length,
          totalQuestionsSoFar: merged.length,
          tokensThisBatch,
          totalTokensUsed: updatePayload.total_tokens_used,
          warnings: newWarnings,
          failedPages,
          successfulPages,
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      )
    } catch (processingError: any) {
      // Si hay error durante el procesamiento, actualizar el job como fallido
      console.error(`Processing error for job ${jobId}:`, processingError)
      
      try {
        await admin
          .from("question_imports")
          .update({
            status: "failed",
            error: processingError?.message || "Processing failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId)
      } catch (updateErr) {
        console.error(`Failed to update job status to failed:`, updateErr)
      }
      
      throw processingError
    } finally {
      await unlockJob(admin, jobId, lockId)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }
})
