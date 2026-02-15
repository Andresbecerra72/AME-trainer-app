export interface QuestionExamSignal {
  id: string
  question_id: string
  user_id: string
  exam_code: string | null
  seen_month: string | null
  confidence: number | null
  note: string | null
  created_at: string
}

export type ExamLikelihood = "none" | "low" | "medium" | "high"

export function getExamLikelihood(count: number): ExamLikelihood {
  if (count <= 0) return "none"
  if (count <= 2) return "low"
  if (count <= 5) return "medium"
  return "high"
}
