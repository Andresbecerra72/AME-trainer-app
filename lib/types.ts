export interface Topic {
  id: string
  title: string
  slug: string
  progress: number
  questionsCount: number
  icon: string
}

export interface Question {
  id: string
  topicId: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: "A" | "B" | "C" | "D"
  isAnswered?: boolean
  userAnswer?: "A" | "B" | "C" | "D"
}

export interface ExamConfig {
  topicIds: string[]
  questionCount: number
  timerEnabled: boolean
  timeLimit?: number
}

export interface ExamResult {
  id: string
  examConfig: ExamConfig
  questions: Question[]
  answers: Record<string, "A" | "B" | "C" | "D">
  flagged: string[]
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  timeSpent: number
  completedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  isGuest: boolean
}

export type UserRole = "user" | "admin" | "super_admin"
export type QuestionStatus = "pending" | "approved" | "rejected"
export type QuestionDifficulty = "easy" | "medium" | "hard"
export type ReportStatus = "pending" | "resolved" | "dismissed"
export type NotificationType = "upvote" | "comment" | "badge" | "report" | "system"

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  reputation: number
  questions_contributed: number
  answers_contributed: number
  upvotes_received: number
  is_verified: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface DbTopic {
  id: string
  name: string
  description: string | null
  icon: string | null
  question_count: number
  created_at: string
}

export interface DbQuestion {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation: string | null
  topic_id: string
  author_id: string
  difficulty: QuestionDifficulty
  status: QuestionStatus
  upvotes: number
  downvotes: number
  comment_count: number
  is_featured: boolean
  report_count: number
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  question_id: string
  author_id: string
  content: string
  upvotes: number
  is_edited: boolean
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Vote {
  id: string
  user_id: string
  question_id: string | null
  comment_id: string | null
  vote_type: number // 1 for upvote, -1 for downvote
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  question_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  question_id: string | null
  comment_id: string | null
  reason: string
  description: string | null
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  resolution_notes: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface ExamHistory {
  id: string
  user_id: string
  topic_ids: string[]
  question_count: number
  correct_answers: number
  incorrect_answers: number
  score_percentage: number
  time_taken: number
  completed_at: string
}

// View models with joined data
export interface QuestionWithDetails extends DbQuestion {
  topic?: DbTopic
  author?: Profile
  user_vote?: number
  is_bookmarked?: boolean
}

export interface CommentWithAuthor extends Comment {
  author: Profile
  user_vote?: number
}

export interface CommunityExam {
  id: string
  title: string
  description: string | null
  created_by: string
  topic_ids: string[]
  question_count: number
  time_limit: number | null
  difficulty: "easy" | "medium" | "hard" | "mixed"
  is_public: boolean
  is_featured: boolean
  rating_average: number
  rating_count: number
  taken_count: number
  created_at: string
  updated_at: string
}

export interface CommunityExamWithDetails extends CommunityExam {
  creator?: Profile
  topics?: DbTopic[]
  user_rating?: number
}

export interface ExamRating {
  id: string
  exam_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  user?: Profile
}
