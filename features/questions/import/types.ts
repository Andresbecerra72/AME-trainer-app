export type ImportJobStatus = "pending" | "processing" | "ready" | "failed"

export type DraftQuestion = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D" | null
  explanation?: string
  confidence?: number
}

export type QuestionImportJob = {
  id: string
  user_id: string
  file_path: string
  file_name: string | null
  file_mime: string | null
  status: ImportJobStatus
  raw_text: string | null
  result: DraftQuestion[] | null
  stats: Record<string, any> | null
  error: string | null
  created_at: string
  updated_at: string
}
