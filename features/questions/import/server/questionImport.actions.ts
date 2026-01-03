"use server"
import { parseQuestionsFromText } from "../parsers/questionText.parser"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DraftQuestion, QuestionImportJob } from "../types"

// Helper function to extract PDF text
async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PdfReader } = require('pdfreader')
      const reader = new PdfReader()
      
      // Store items with their position to reconstruct text properly
      const rows: { [key: number]: string[] } = {}
      let hasReceivedData = false
      
      reader.parseBuffer(buffer, (err: any, item: any) => {
        if (err) {
          console.error('PDF parsing error:', err)
          reject(new Error(`PDF parsing failed: ${err.message || err}`))
        } else if (!item) {
          // End of parsing - reconstruct text from rows
          if (!hasReceivedData) {
            reject(new Error('No text data extracted from PDF'))
            return
          }
          
          const lines = Object.keys(rows)
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .map(y => rows[parseFloat(y)].join(''))
          
          const text = lines.join('\n').trim()
          console.log(`Reconstructed ${lines.length} lines of text`)
          resolve(text)
        } else if (item.text) {
          // Group text by Y position (row)
          hasReceivedData = true
          const y = item.y || 0
          if (!rows[y]) rows[y] = []
          rows[y].push(item.text)
        }
      })
    } catch (error: any) {
      console.error('Error initializing PDF reader:', error)
      reject(new Error(`Failed to initialize PDF reader: ${error.message || error}`))
    }
  })
}

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
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ jobId }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    console.log("EDGE Function - Import job processed:", result)
    return { status: "ready", detected: result.detected || 0 }
  } catch (e: any) {
    // Don't mark as failed if it's a timeout error (504, 503)
    // The Edge Function might still be processing and will update the status when done
    const isTimeout = e?.message?.includes('504') || e?.message?.includes('503')
    
    if (!isTimeout) {
      // Only mark as failed for actual errors (not timeouts)
      await supabase
        .from("question_imports")
        .update({
          status: "failed",
          error: e?.message ?? "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
    } else {
      console.log(`Timeout received for job ${jobId}, but processing continues in background`)
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
      .upload(path, buffer, { upsert: true })
    
    if (uploadError) {
      console.warn("Failed to upload file to storage (non-critical):", uploadError)
      // Continue anyway - we have the text
    }
    
    // 3. Update job with extracted text, pages array, and metadata
    const updatePayload: any = {
      file_path: path,
      raw_text: input.rawText,
      stats: {
        extraction_method: input.extractionMethod,
        text_length: input.rawText.length,
        page_count: hasPages ? input.rawPages!.length : 1,
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
    // Don't await - let it process in background to avoid HTTP 504 timeout
    // The client polling will pick up the result when ready
    processImportJob(job.id).catch(err => {
      console.error(`Background processing failed for job ${job.id}:`, err)
      // Timeout errors (504) are expected and job will be updated by Edge Function
      // Other errors will be visible in job status via polling
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