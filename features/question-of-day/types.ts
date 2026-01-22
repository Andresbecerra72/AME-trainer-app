import type { QuestionDifficulty, QuestionStatus } from "@/lib/types"

export interface QuestionOfDayQuestion {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation: string | null
  difficulty: QuestionDifficulty
  status: QuestionStatus
  topic_id: string
  author_id: string
  created_at: string
  topic?: {
    id: string
    name: string
    code: string
  }
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface QuestionOfDay {
  id: string
  question_id: string
  date: string
  created_at: string
  question: QuestionOfDayQuestion
}

export interface QuestionOfDayResponse {
  question: QuestionOfDayQuestion
  date: string
}
