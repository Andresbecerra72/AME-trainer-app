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

export interface ExamSignalScore {
  count: number
  likelihood: ExamLikelihood
  score: number
}

/**
 * Simple count-based exam likelihood (MVP)
 */
export function getExamLikelihood(count: number): ExamLikelihood {
  if (count <= 0) return "none"
  if (count <= 2) return "low"
  if (count <= 5) return "medium"
  return "high"
}

/**
 * Enhanced weighted exam likelihood calculator
 * 
 * @param signalCount - Raw count of exam signals
 * @param averageUserReputation - Average reputation of users who signaled (optional)
 * @param questionRating - Question upvote score (optional, upvotes - downvotes)
 * @param isDoubtful - Whether question is marked as doubtful (penalty)
 * @returns ExamSignalScore with count, likelihood, and weighted score
 */
export function calculateExamLikelihood(
  signalCount: number,
  options?: {
    averageUserReputation?: number
    questionRating?: number
    isDoubtful?: boolean
  }
): ExamSignalScore {
  if (signalCount <= 0) {
    return { count: 0, likelihood: "none", score: 0 }
  }

  // Base score from signal count (0-100 scale)
  let score = Math.min(signalCount * 10, 60)

  // Reputation boost (max +20 points)
  if (options?.averageUserReputation) {
    const repScore = Math.min(options.averageUserReputation / 50, 20)
    score += repScore
  }

  // Question rating boost (max +15 points)
  if (options?.questionRating !== undefined) {
    const ratingBoost = Math.min(Math.max(options.questionRating, 0) / 2, 15)
    score += ratingBoost
  }

  // Doubtful penalty (-10 points)
  if (options?.isDoubtful) {
    score = Math.max(score - 10, 0)
  }

  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score))

  // Determine likelihood from score
  let likelihood: ExamLikelihood
  if (score >= 70) likelihood = "high"
  else if (score >= 45) likelihood = "medium"
  else if (score >= 15) likelihood = "low"
  else likelihood = "none"

  return {
    count: signalCount,
    likelihood,
    score: Math.round(score),
  }
}
