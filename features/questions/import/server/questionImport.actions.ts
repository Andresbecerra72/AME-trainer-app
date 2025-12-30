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

  const payload = input.questions.map(q => ({
    ...q,
    topic_id: input.topic_id,
    difficulty: input.difficulty,
    status: "pending", // ensure moderation flow
  }))
  
  const { error } = await supabase.from("questions").insert(payload)
  if (error) throw new Error(error.message)

  return { inserted: payload.length }
}

// NOTE: This function assumes you will extract PDF text.
// For now: we keep structure and leave extraction as a TODO placeholder.

export async function processImportJob(jobId: string) {
  const supabase = await createSupabaseServerClient()

  // Mark processing
  {
    const { error } = await supabase
      .from("question_imports")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId)
    if (error) throw new Error(error.message)
  }

  // Load job
  const { data: job, error: jobError } = await supabase
    .from("question_imports")
    .select("id, file_path, file_mime")
    .eq("id", jobId)
    .single()

  if (jobError) throw new Error(jobError.message)

  try {
    // TODO (Phase 2 recommended): download file from Storage using service role
    // and extract text for PDFs. For now, we fail clearly.
    if (!job.file_mime?.includes("pdf")) {
      throw new Error("Phase 1 only supports PDF text extraction. Image OCR is phase 2.")
    }

    // Placeholder: you will replace with actual pdf->text extraction
    const extractedText = "" // <-- implement in phase 2

    const drafts: DraftQuestion[] = parseQuestionsFromText(extractedText)
    const stats = { detected: drafts.length }

    const { error: updError } = await supabase
      .from("question_imports")
      .update({
        status: "ready",
        raw_text: extractedText,
        result: drafts,
        stats,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    if (updError) throw new Error(updError.message)

    return { status: "ready", detected: drafts.length }
  } catch (e: any) {
    await supabase
      .from("question_imports")
      .update({
        status: "failed",
        error: e?.message ?? "Unknown error",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)

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