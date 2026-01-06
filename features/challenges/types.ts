export interface Challenge {
  id: string
  title: string
  description: string | null
  question_count: number
  start_date: string
  end_date: string
  created_at: string
}

export interface ChallengeAttempt {
  id: string
  challenge_id: string
  user_id: string
  score: number
  total_questions: number
  time_taken: number
  completed_at: string
  user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface ChallengePageData {
  challenge: Challenge | null
  leaderboard: ChallengeAttempt[]
  userAttempt: ChallengeAttempt | null
}
