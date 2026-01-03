/**
 * Lógica de negocio para el setup de exámenes
 * Separa la lógica del componente para mantener código limpio
 */

export interface TopicWithCount {
  id: string
  name: string
  code: string
  question_count: number
}

export interface Category {
  code: string
  name: string
  totalQuestions: number
  topics: TopicWithCount[]
}

export interface Rating {
  code: string
  name: string
  description: string
}

export const DEFAULT_QUESTION_COUNT = 70

/**
 * Extrae el rating del código del topic (M-SPM-01 -> M)
 */
export function extractRating(topicCode: string): string {
  return topicCode.split("-")[0]
}

/**
 * Extrae la categoría del código del topic (M-SPM-01 -> SPM)
 */
export function extractCategory(topicCode: string): string {
  return topicCode.split("-")[1]
}

/**
 * Agrupa topics por rating
 */
export function groupTopicsByRating(topics: TopicWithCount[]): Record<string, TopicWithCount[]> {
  return topics.reduce(
    (acc, topic) => {
      const rating = extractRating(topic.code)
      if (!acc[rating]) {
        acc[rating] = []
      }
      acc[rating].push(topic)
      return acc
    },
    {} as Record<string, TopicWithCount[]>
  )
}

/**
 * Agrupa topics por categoría dentro de un rating
 */
export function groupTopicsByCategory(topics: TopicWithCount[]): Category[] {
  const categoryMap = topics.reduce(
    (acc, topic) => {
      const category = extractCategory(topic.code)
      if (!acc[category]) {
        acc[category] = {
          code: category,
          name: getCategoryName(category),
          totalQuestions: 0,
          topics: [],
        }
      }
      acc[category].topics.push(topic)
      acc[category].totalQuestions += topic.question_count
      return acc
    },
    {} as Record<string, Category>
  )

  return Object.values(categoryMap)
}

/**
 * Obtiene el nombre completo del rating
 */
export function getRatingName(ratingCode: string): string {
  const ratings: Record<string, string> = {
    M: "M Rating",
    E: "E Rating",
    S: "S Rating",
  }
  return ratings[ratingCode] || ratingCode
}

/**
 * Obtiene la descripción del rating
 */
export function getRatingDescription(ratingCode: string): string {
  const descriptions: Record<string, string> = {
    M: "Maintenance Engineer",
    E: "Electronics/Avionics",
    S: "Structures",
  }
  return descriptions[ratingCode] || ""
}

/**
 * Obtiene el nombre completo de la categoría
 */
export function getCategoryName(categoryCode: string): string {
  const categories: Record<string, string> = {
    SPM: "Standard Practices & Maintenance",
    AF: "Airframe",
    PP: "Powerplant",
    SPE: "Standard Practices Electronics",
    ST: "Structures",
  }
  return categories[categoryCode] || categoryCode
}

/**
 * Valida la configuración del examen
 */
export function validateExamConfig(
  selectedCategory: string | null,
  questionCount: number
): { isValid: boolean; error?: string } {
  if (!selectedCategory) {
    return { isValid: false, error: "Select a category" }
  }

  if (questionCount < 5) {
    return { isValid: false, error: "Minimum 5 questions" }
  }

  if (questionCount > 100) {
    return { isValid: false, error: "Maximum 100 questions" }
  }

  return { isValid: true }
}

/**
 * Construye los parámetros para iniciar el examen
 */
export function buildExamParams(
  selectedCategory: string,
  topicIds: string[],
  questionCount: number,
  timerEnabled: boolean
): URLSearchParams {
  const params = new URLSearchParams()
  params.set("category", selectedCategory)
  params.set("topics", topicIds.join(","))
  params.set("count", questionCount.toString())
  params.set("timer", timerEnabled.toString())
  return params
}
