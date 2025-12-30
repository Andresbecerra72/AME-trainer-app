"use server"
import { parseQuestionsFromText } from "../parsers/questionText.parser"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DraftQuestion } from "../types"

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
