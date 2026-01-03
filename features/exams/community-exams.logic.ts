/**
 * L\u00f3gica de negocio para Community Exams
 * Maneja validaciones, c\u00e1lculos y transformaciones
 */

export const MAX_TOTAL_QUESTIONS = 70
export const MIN_QUESTIONS_PER_TOPIC = 1

export interface TopicWithQuestions {
  id: string
  name: string
  code: string
  question_count: number
  selected_count: number
}

export interface CommunityExamConfig {
  title: string
  description: string
  rating: string
  category: string
  topicQuestions: Map<string, number> // topicId -> question count
  timeLimit?: number
  difficulty: "easy" | "medium" | "hard" | "mixed"
  isPublic: boolean
}

export interface CommunityExamFormData {
  title: string
  description: string
  timeLimit: number
  difficulty: string
  isPublic: boolean
}

/**
 * Extrae rating del c\u00f3digo del topic
 */
export function extractRating(code: string): string {
  return code.split("-")[0]
}

/**
 * Extrae categor\u00eda del c\u00f3digo del topic
 */
export function extractCategory(code: string): string {
  return code.split("-")[1]
}

/**
 * Agrupa topics por rating
 */
export function groupTopicsByRating(topics: TopicWithQuestions[]): Record<string, TopicWithQuestions[]> {
  return topics.reduce(
    (acc, topic) => {
      const rating = extractRating(topic.code)
      if (!acc[rating]) acc[rating] = []
      acc[rating].push(topic)
      return acc
    },
    {} as Record<string, TopicWithQuestions[]>
  )
}

/**
 * Agrupa topics por categor\u00eda
 */
export function groupTopicsByCategory(topics: TopicWithQuestions[]): Record<string, TopicWithQuestions[]> {
  return topics.reduce(
    (acc, topic) => {
      const category = extractCategory(topic.code)
      if (!acc[category]) acc[category] = []
      acc[category].push(topic)
      return acc
    },
    {} as Record<string, TopicWithQuestions[]>
  )
}

/**
 * Calcula el total de preguntas seleccionadas
 */
export function calculateTotalQuestions(topicQuestions: Map<string, number>): number {
  return Array.from(topicQuestions.values()).reduce((sum, count) => sum + count, 0)
}

/**
 * Valida el total de preguntas
 */
export function validateTotalQuestions(total: number): { isValid: boolean; error?: string } {
  if (total === 0) {
    return { isValid: false, error: "Select at least one question" }
  }
  if (total > MAX_TOTAL_QUESTIONS) {
    return { isValid: false, error: `Maximum ${MAX_TOTAL_QUESTIONS} questions allowed` }
  }
  return { isValid: true }
}

/**
 * Valida la configuraci\u00f3n del formulario
 */
export function validateExamForm(
  formData: CommunityExamFormData,
  topicQuestions: Map<string, number>
): { isValid: boolean; error?: string } {
  if (!formData.title.trim()) {
    return { isValid: false, error: "Title is required" }
  }

  if (formData.title.length < 5) {
    return { isValid: false, error: "Title must be at least 5 characters" }
  }

  if (formData.title.length > 100) {
    return { isValid: false, error: "Title must be less than 100 characters" }
  }

  const totalQuestions = calculateTotalQuestions(topicQuestions)
  const questionValidation = validateTotalQuestions(totalQuestions)
  
  if (!questionValidation.isValid) {
    return questionValidation
  }

  if (formData.timeLimit && formData.timeLimit < 1) {
    return { isValid: false, error: "Time limit must be at least 1 minute" }
  }

  if (formData.timeLimit && formData.timeLimit > 180) {
    return { isValid: false, error: "Time limit cannot exceed 180 minutes" }
  }

  return { isValid: true }
}

/**
 * Calcula el tiempo recomendado basado en el n\u00famero de preguntas
 */
export function calculateRecommendedTime(totalQuestions: number): number {
  // 1 minuto por pregunta como base
  return totalQuestions
}

/**
 * Convierte topicQuestions Map a formato para DB
 */
export function formatTopicQuestionsForDB(topicQuestions: Map<string, number>): {
  topic_ids: string[]
  question_count: number
} {
  const topic_ids = Array.from(topicQuestions.keys())
  const question_count = calculateTotalQuestions(topicQuestions)
  
  return {
    topic_ids,
    question_count,
  }
}

/**
 * Obtiene el color del badge de dificultad
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    mixed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  }
  return colors[difficulty] || colors.mixed
}

/**
 * Formatea el rating y categor\u00eda para display
 */
export function getRatingCategoryDisplay(rating: string, category: string): {
  ratingName: string
  categoryName: string
} {
  const ratings: Record<string, string> = {
    M: "M Rating",
    E: "E Rating",
    S: "S Rating",
  }

  const categories: Record<string, string> = {
    SPM: "Standard Practices",
    AF: "Airframe",
    PP: "Powerplant",
    SPE: "Avionics",
    ST: "Structures",
  }

  return {
    ratingName: ratings[rating] || rating,
    categoryName: categories[category] || category,
  }
}

/**
 * Genera un resumen del examen para mostrar antes de crear
 */
export function generateExamSummary(
  formData: CommunityExamFormData,
  topicQuestions: Map<string, number>,
  rating: string,
  category: string
): string[] {
  const totalQuestions = calculateTotalQuestions(topicQuestions)
  const { ratingName, categoryName } = getRatingCategoryDisplay(rating, category)
  
  const summary: string[] = [
    `${totalQuestions} questions total`,
    `${ratingName} - ${categoryName}`,
    `${topicQuestions.size} topic${topicQuestions.size !== 1 ? "s" : ""} covered`,
  ]

  if (formData.timeLimit) {
    summary.push(`${formData.timeLimit} minute time limit`)
  } else {
    summary.push("No time limit")
  }

  summary.push(`Difficulty: ${formData.difficulty}`)
  summary.push(formData.isPublic ? "Public exam" : "Private exam")

  return summary
}
