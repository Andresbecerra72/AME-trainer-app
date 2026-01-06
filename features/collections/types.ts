export interface Collection {
  id: string
  name: string
  description: string | null
  is_public: boolean
  user_id: string
  created_at: string
  question_count?: { count: number }[]
}

export interface CollectionWithCount extends Omit<Collection, 'question_count'> {
  questionCount: number
}
