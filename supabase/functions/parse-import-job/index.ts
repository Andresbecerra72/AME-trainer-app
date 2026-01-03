import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

// ===================================
// CONSTANTS
// ===================================
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

const BATCH_SIZE = 5 // Process 5 pages at a time in parallel
const MIN_TEXT_LENGTH = 20

// ===================================
// TYPES
// ===================================
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
  raw_text: string
  raw_pages?: any
}

type PageResult = {
  pageNum: number
  questions: DraftQuestion[]
  tokens: number
}

// ===================================
// OPENAI CONFIGURATION
// ===================================
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

function getModelConfig(estimatedTokens: number) {
  if (estimatedTokens > 30000) {
    return { model: "gpt-4o", maxTokens: 16000 }
  }
  return { model: "gpt-4-turbo-preview", maxTokens: 4096 }
}

// ===================================
// OPENAI API CALLS
// ===================================
async function callOpenAI(
  apiKey: string,
  text: string,
  model: string,
  maxTokens: number,
  pageInfo?: { pageNum: number, totalPages: number }
): Promise<{ items: DraftQuestion[], tokensUsed: number }> {
  const pageLabel = pageInfo 
    ? `\n\nText to process (Page ${pageInfo.pageNum} of ${pageInfo.totalPages}):\n"""\n${text}\n"""`
    : `\n\nText to process:\n"""\n${text}\n"""`

  const promptWithText = getOpenAIPrompt() + pageLabel

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { 
          role: "system", 
          content: "You are an expert at extracting exam questions from ANY format. Extract ALL questions from this page, regardless of formatting. Be flexible with format recognition but strict with JSON output. Maintain original language." 
        },
        { role: "user", content: promptWithText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenAI API error: ${errText}`)
  }

  const data = await response.json()
  const tokensUsed = data.usage?.total_tokens || 0
  const outputText = data.choices?.[0]?.message?.content

  if (!outputText) {
    return { items: [], tokensUsed }
  }

  const parsed = JSON.parse(outputText)
  const items = Array.isArray(parsed) ? parsed : (parsed.items || [])

  return { items, tokensUsed }
}

// ===================================
// PAGE PROCESSING
// ===================================
async function processPage(
  apiKey: string,
  pageText: string,
  pageNum: number,
  totalPages: number
): Promise<PageResult> {
  const estimatedTokens = Math.ceil(pageText.length / 4) + 300
  console.log(`--- Page ${pageNum}/${totalPages} (${pageText.length} chars, ~${estimatedTokens} tokens) ---`)

  try {
    const { items, tokensUsed } = await callOpenAI(
      apiKey,
      pageText,
      "gpt-4o-mini",
      4096,
      { pageNum, totalPages }
    )

    if (items.length > 0) {
      console.log(`✓ Page ${pageNum}: Extracted ${items.length} questions`)
    } else {
      console.log(`⚠ Page ${pageNum}: No questions found`)
    }

    return { pageNum, questions: items as DraftQuestion[], tokens: tokensUsed }
  } catch (error: any) {
    console.error(`Page ${pageNum} error:`, error.message)
    return { pageNum, questions: [], tokens: 0 }
  }
}

async function processPageByPage(
  apiKey: string,
  pages: string[]
): Promise<{ questions: DraftQuestion[], totalTokens: number }> {
  console.log(`\n🔄 Starting page-by-page processing (${pages.length} pages, batch size: ${BATCH_SIZE})...`)

  const batches: number[][] = []
  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    batches.push(Array.from({ length: Math.min(BATCH_SIZE, pages.length - i) }, (_, j) => i + j))
  }

  const allQuestions: DraftQuestion[] = []
  let totalTokens = 0

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]
    console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length}: Pages ${batch.map(i => i + 1).join(', ')}`)

    const batchPromises = batch.map(pageIndex =>
      processPage(apiKey, pages[pageIndex], pageIndex + 1, pages.length)
    )

    const results = await Promise.all(batchPromises)

    for (const result of results) {
      allQuestions.push(...result.questions)
      totalTokens += result.tokens
    }

    console.log(`✓ Batch ${batchIndex + 1} complete: ${allQuestions.length} total questions`)
  }

  console.log(`\n✓ Page-by-page complete: ${allQuestions.length} questions, ${totalTokens} tokens`)
  return { questions: allQuestions, totalTokens }
}

async function processSingleChunk(
  apiKey: string,
  text: string
): Promise<{ questions: DraftQuestion[], totalTokens: number }> {
  console.log(`📝 Single chunk mode: ${text.length} characters`)
  console.log(`\n=== FIRST 500 CHARS ===\n${text.substring(0, 500)}`)
  console.log(`\n=== MIDDLE 500 CHARS ===\n${text.substring(Math.floor(text.length / 2) - 250, Math.floor(text.length / 2) + 250)}`)
  console.log(`\n=== LAST 300 CHARS ===\n${text.substring(text.length - 300)}\n`)

  const estimatedTokens = Math.ceil(text.length / 4) + 300
  const { model, maxTokens } = getModelConfig(estimatedTokens)

  console.log(`Using model: ${model} (max_tokens: ${maxTokens})`)

  const { items, tokensUsed } = await callOpenAI(apiKey, text, model, maxTokens)

  if (!items || items.length === 0) {
    throw new Error("No questions extracted from text")
  }

  return { questions: items as DraftQuestion[], totalTokens: tokensUsed }
}

// ===================================
// DATABASE OPERATIONS
// ===================================
async function updateJobStatus(adminClient: any, jobId: string, status: string, error?: string) {
  return adminClient
    .from("question_imports")
    .update({ 
      status, 
      error: error || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId)
}

async function saveJobResults(
  adminClient: any,
  jobId: string,
  questions: DraftQuestion[],
  job: ImportJob,
  totalTokens: number,
  usePageByPage: boolean
) {
  const mime = job.file_mime ?? ""
  let fileType = "text"
  if (mime.includes("pdf") || job.file_path.toLowerCase().endsWith(".pdf")) {
    fileType = "pdf"
  } else if (mime.startsWith("image/")) {
    fileType = "image"
  }

  const stats = {
    detected: questions.length,
    type: fileType,
    parser: usePageByPage ? "openai_page_by_page" : "openai_chat_completions",
    processing_mode: usePageByPage ? "page_by_page" : "single_chunk",
    total_pages: usePageByPage && job.raw_pages ? job.raw_pages.length : 1,
    text_length: job.raw_text.length,
    total_tokens_used: totalTokens,
    processed_at: new Date().toISOString(),
  }

  const { error } = await adminClient
    .from("question_imports")
    .update({
      status: "ready",
      raw_text: job.raw_text,
      result: questions,
      stats,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`)
  }

  return stats
}

// ===================================
// MAIN HANDLER
// ===================================
Deno.serve(async (req: Request) => {
  console.log("===== Edge function ======")

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  try {
    // Environment validation
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!

    if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY || !OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // User authentication
    const authHeader = req.headers.get("Authorization") ?? ""
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authErr } = await userClient.auth.getUser()

    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // Request validation
    const body = await req.json().catch(() => null)
    const jobId = body?.jobId as string | undefined

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Missing jobId" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // Load job
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: job, error: jobError } = await adminClient
      .from("question_imports")
      .select("id,user_id,file_path,file_mime,status,raw_text,raw_pages")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    const importJob = job as ImportJob

    // Authorization check
    if (importJob.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // Validate input text
    if (!importJob.raw_text || importJob.raw_text.trim().length === 0) {
      await updateJobStatus(
        adminClient,
        jobId,
        "failed",
        "No text provided. Text extraction must be done on the client side before calling this function."
      )

      return new Response(
        JSON.stringify({ error: "raw_text is required and must not be empty" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // Mark as processing
    await updateJobStatus(adminClient, jobId, "processing")

    // Determine processing mode
    const pages = importJob.raw_pages && Array.isArray(importJob.raw_pages) ? importJob.raw_pages : null
    const usePageByPage = pages && pages.length > 0

    console.log(`Processing job ${jobId}: ${importJob.raw_text.length} chars`)
    if (usePageByPage) {
      console.log(`📄 Page-by-page mode: ${pages.length} pages`)
    }

    // Process questions
    let questions: DraftQuestion[]
    let totalTokens: number

    try {
      if (usePageByPage) {
        const result = await processPageByPage(OPENAI_API_KEY, pages)
        questions = result.questions
        totalTokens = result.totalTokens
      } else {
        const result = await processSingleChunk(OPENAI_API_KEY, importJob.raw_text)
        questions = result.questions
        totalTokens = result.totalTokens
      }
    } catch (error: any) {
      await updateJobStatus(adminClient, jobId, "failed", error.message)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // Save results
    const stats = await saveJobResults(
      adminClient,
      jobId,
      questions,
      importJob,
      totalTokens,
      usePageByPage
    )

    console.log(`✓ Job ${jobId} completed: ${questions.length} questions`)

    return new Response(
      JSON.stringify({ ok: true, jobId, detected: questions.length, stats }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    console.error("Edge function error:", msg)
    console.error("Stack:", e instanceof Error ? e.stack : "No stack trace")

    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )
  }
})
