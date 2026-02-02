"use server"
import { parseQuestionsFromText } from "../parsers/questionText.parser"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DraftQuestion, QuestionImportJob } from "../types"

export async function createQuestionsBatch(input: {
  topic_id: string
  difficulty: "easy" | "medium" | "hard"
  questions: DraftQuestion[]
}) {
  const supabase = await createSupabaseServerClient()

  if (!input.topic_id) throw new Error("topic_id is required")
  if (!input.questions.length) return { inserted: 0 }
   const {
      data: { user },
    } = await supabase.auth.getUser()

  const payload = input.questions.map(q => ({
    ...q,
    topic_id: input.topic_id,
    difficulty: input.difficulty,
    status: "pending", // ensure moderation flow
    author_id: user?.id,
    option_a: q.option_a || "---",
    option_b: q.option_b || "---",
    option_c: q.option_c || "---",
    option_d: q.option_d || "---",
  }))

  
    const { error } = await supabase.from("questions").insert(payload)
  if (error) throw new Error(error.message)

  return { inserted: payload.length }
}

// NOTE: This function calls the Edge Function to parse files
export async function processImportJob(jobId: string) {
  const supabase = await createSupabaseServerClient()

  // Get user session
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    throw new Error("User not authenticated")
  }

  const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/parse-import-job`
    : "http://127.0.0.1:54321/functions/v1/parse-import-job"
    
  

  try {
     // 1) Encolar el job (Edge Function parse-import-job)
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ jobId }),
    })

    console.log("parse-import-job: ", response )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const queueResult = await response.json()
    console.log("Job enqueued:", queueResult)

   
    // Job completado
    return { status: "ready", message: "Job completed successfully" }
  } catch (e: any) {
    const isTimeout = e?.message?.includes('504') || e?.message?.includes('503') || e?.message?.includes('546')
    
    if (!isTimeout) {
      // Marcar como fallido solo si no es timeout
      await supabase
        .from("question_imports")
        .update({
          status: "failed",
          error: e?.message ?? "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
    } else {
      console.log(`Timeout received for job ${jobId}, processing continues in background`)
      // No lanzar error en timeout, retornar estado de procesamiento
      return { 
        status: "processing", 
        message: "Job is processing in background due to timeout",
        background: true 
      }
    }

    throw e
  }
}

export async function createImportJob(input: {
  userId: string
  filePath: string
  fileName?: string
  fileMime?: string
}): Promise<QuestionImportJob> {
  const supabase = await createSupabaseServerClient()
  console.log("SERVER", input)
  const { data, error } = await supabase
    .from("question_imports")
    .insert({
      user_id: input.userId,
      file_path: input.filePath,
      file_name: input.fileName ?? null,
      file_mime: input.fileMime ?? null,
      status: "pending",
    })
    .select("*")
    .single()
  console.log("INSERT question_imports", error, data)
  if (error) throw new Error(error.message)
  return data as QuestionImportJob
}

export async function updateImportJobPath(jobId: string, filePath: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("question_imports")
    .update({ file_path: filePath })
    .eq("id", jobId)
  console.log("UPDATED question_imports", error, data)
}

export async function getImportJob(jobId: string): Promise<QuestionImportJob> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("question_imports")
    .select("*")
    .eq("id", jobId)
    .single()

  if (error) throw new Error(error.message)
  return data as QuestionImportJob
}

/**
 * Poll job status for client-side monitoring
 * Returns current status, progress, and extracted questions count
 */
export async function pollImportJobStatus(jobId: string): Promise<{
  status: string
  progress?: { current: number; total: number; percentage: number }
  questionsExtracted?: number
  error?: string
  done: boolean
  warnings?: Array<{ page: number; type: string; message: string }>
  failedPages?: number[]
  successfulPages?: number[]
}> {
  const supabase = await createSupabaseServerClient()
  
  const { data: job, error } = await supabase
    .from("question_imports")
    .select("status, next_page, total_pages, completed_pages, result, error, stats, raw_pages")
    .eq("id", jobId)
    .single()

  if (error) throw new Error(error.message)

  // Extract stats for progress tracking
  const stats = (job.stats as any) || {}
  
  // Get total pages from stats first, then raw_pages array, then total_pages column
  const totalPages = stats.total_pages || 
                     (job.raw_pages && Array.isArray(job.raw_pages) ? job.raw_pages.length : null) ||
                     job.total_pages || 
                     1
  
  // Get completed pages from stats first (most up-to-date), then from column
  const completedPages = stats.completed_pages ?? job.completed_pages ?? 0
  
  // Calculate real percentage
  const percentage = totalPages > 0 
    ? Math.round((completedPages / totalPages) * 100)
    : 0
  
  // Get questions from result array
  const questionsExtracted = Array.isArray(job.result) ? job.result.length : 0
  
  // Extract warnings from stats
  const warnings = Array.isArray(stats.warnings) ? stats.warnings : []
  const failedPages = Array.isArray(stats.failed_pages) ? stats.failed_pages : []
  const successfulPages = Array.isArray(stats.successful_pages) ? stats.successful_pages : []

  console.log(`[POLL] Job ${jobId}: ${completedPages}/${totalPages} pages (${percentage}%) - ${questionsExtracted} questions`)

  return {
    status: job.status,
    progress: {
      current: completedPages,
      total: totalPages,
      percentage
    },
    questionsExtracted,
    error: job.error,
    done: job.status === "ready" || job.status === "failed",
    warnings,
    failedPages,
    successfulPages,
  }
}

export async function uploadImportFile(input: {
  userId: string
  file: File
  jobId: string
}) {
  const supabase = await createSupabaseServerClient()

  const path = `${input.userId}/${input.jobId}/${input.file.name}`

  const { error } = await supabase.storage
    .from("question-imports")
    .upload(path, input.file, { upsert: true })

  if (error) throw new Error(error.message)
  return { path }
}

// Trigger Edge Function to parse import job
export async function triggerParseImportJobServer(jobId: string) {
  const supabase = await createSupabaseServerClient()
  const res = await supabase.functions.invoke('parse-import-job', 
    {
       body: { jobId },
    })

  if (res.error) {   
    throw new Error(res.error.message ?? `Failed to trigger parse job (${res.response?.status})`)
  }

  return res.data
}

/**
 * Upload file metadata with pre-extracted text and trigger parsing
 * Text extraction is done on the client side for better performance
 */
export async function uploadTextExtract(input: {
  file: File
  userId: string
  rawText: string
  rawPages?: string[] // Array of individual pages for page-by-page processing
  extractionMethod: 'pdf' | 'ocr'
}): Promise<QuestionImportJob> {
  const supabase = await createSupabaseServerClient()
  
  try {
    const hasPages = input.rawPages && input.rawPages.length > 0
    console.log(`Creating import job with ${input.rawText.length} characters (method: ${input.extractionMethod})`)
    
    if (hasPages) {
      console.log(`📄 Page-by-page mode enabled: ${input.rawPages!.length} pages`)
    }
    
    // 1. Create job with raw_text already provided
    const job = await createImportJob({
      userId: input.userId,
      filePath: "text-extracted-on-client",
      fileName: input.file.name,
      fileMime: input.file.type,
    })
    
    // 2. Upload file to Storage (for reference/audit purposes)
    const arrayBuffer = await input.file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const path = `${input.userId}/${job.id}/${input.file.name}`
    const { error: uploadError } = await supabase.storage
      .from('question-imports')
      .upload(path, buffer, { 
        upsert: true,
        contentType: input.file.type || 'application/pdf'
      })
    
    if (uploadError) {
      console.warn("Failed to upload file to storage (non-critical):", uploadError)
      // Continue anyway - we have the text
    }
    
    // 3. Update job with extracted text, pages array, and metadata
    const totalPages = hasPages ? input.rawPages!.length : 1
    const updatePayload: any = {
      file_path: path,
      raw_text: input.rawText,
      total_pages: totalPages,
      completed_pages: 0,
      next_page: 1,
      stats: {
        extraction_method: input.extractionMethod,
        text_length: input.rawText.length,
        page_count: totalPages,
        total_pages: totalPages,
        completed_pages: 0,
        extracted_at: new Date().toISOString(),
        client_side: true,
      },
      updated_at: new Date().toISOString()
    }
    
    // Include raw_pages if available (for page-by-page processing)
    if (hasPages) {
      updatePayload.raw_pages = input.rawPages
    }
    
    const { data: updatedJob, error: updateError } = await supabase
      .from('question_imports')
      .update(updatePayload)
      .eq('id', job.id)
      .select('*')
      .single()
    
    if (updateError) throw new Error(updateError.message)
    
    // 4. Mark job as 'processing' before triggering Edge Function
    await supabase
      .from('question_imports')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id)
    
    console.log(`Job ${job.id} created with text${hasPages ? ' and pages' : ''}, triggering parser...`)
    
    // 5. Trigger Edge Function to parse the extracted text (fire and forget)
    // No esperamos la respuesta para evitar timeouts en archivos grandes
    // El cliente debe hacer polling del estado del job
    processImportJob(job.id)
      .then(result => {
        console.log(`Job ${job.id} processing completed:`, result)
      })
      .catch(err => {
        // Solo logueamos errores graves (no timeouts)
        if (!err?.message?.includes('504') && !err?.message?.includes('503') && !err?.message?.includes('546')) {
          console.error(`Background processing failed for job ${job.id}:`, err)
        }
      })
    
    return updatedJob as QuestionImportJob
  } catch (error: any) {
    console.error('Error in uploadTextExtract:', error)
    throw new Error(error?.message ?? 'Failed to process extracted text')
  }
}

/**
 * @deprecated Use uploadTextExtract instead - text extraction should be done on client side
 * Upload PDF, extract text, and process in one action
 * This is kept for backward compatibility
 */
export async function uploadAndExtractPdf(file: File, userId: string): Promise<QuestionImportJob> {
  const supabase = await createSupabaseServerClient()
  
  try {
    // 1. Create job
    const job = await createImportJob({
      userId,
      filePath: "pending",
      fileName: file.name,
      fileMime: file.type,
    })
    
    // 2. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 3. Upload to Storage
    const path = `${userId}/${job.id}/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('question-imports')
      .upload(path, buffer, { upsert: true })
    
    if (uploadError) throw new Error(uploadError.message)
    
    // 4. Extract text based on file type
    let rawText = ""
    if (file.type === 'application/pdf') {
      console.log('Extracting text from PDF...')
      try {
        rawText = null as any //await extractPdfText(buffer)
        console.log(`Extracted ${rawText.length} characters from PDF`)
        console.log('First 500 chars:', rawText.substring(0, 500))
      } catch (pdfError: any) {
        console.error('PDF extraction error:', pdfError)
        rawText = null as any
        //throw new Error(`Failed to extract text from PDF: ${pdfError.message}`)
      }
    } else if (file.type === 'text/plain') {
      rawText = new TextDecoder().decode(buffer)
    } else {
      throw new Error(`Unsupported file type: ${file.type}`)
    }
    
    // 5. Update job with path and extracted text
    const { data: updatedJob, error: updateError } = await supabase
      .from('question_imports')
      .update({
        file_path: path,
        raw_text: rawText,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id)
      .select('*')
      .single()
    
    if (updateError) throw new Error(updateError.message)
    
    // 6. Trigger Edge Function to parse the extracted text
    await processImportJob(job.id)
    
    return updatedJob as QuestionImportJob
  } catch (error: any) {
    console.error('Error in uploadAndExtractPdf:', error)
    throw new Error(error?.message ?? 'Failed to upload and extract PDF')
  }
}