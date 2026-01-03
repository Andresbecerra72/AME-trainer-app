/**
 * Lógica de negocio para el historial de exámenes
 * Mantiene los cálculos y transformaciones separados del componente
 */

export interface TopicInfo {
  id: string
  name: string
  code: string
}

export interface ExamHistoryRecord {
  id: string
  user_id: string
  topic_ids: string[]
  question_count: number
  correct_answers: number
  incorrect_answers: number
  score_percentage: number
  time_taken: number
  completed_at: string
  topics?: TopicInfo[]
}

export interface ExamStats {
  totalExams: number
  avgScore: number
  totalQuestions: number
  totalCorrect: number
  bestScore: number
  worstScore: number
}

/**
 * Extrae el rating del código del topic (M-SPM-01 -> M)
 */
export function extractRatingFromCode(code: string): string {
  return code.split("-")[0]
}

/**
 * Extrae la categoría del código del topic (M-SPM-01 -> SPM)
 */
export function extractCategoryFromCode(code: string): string {
  return code.split("-")[1]
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
 * Obtiene el nombre completo de la categoría
 */
export function getCategoryName(categoryCode: string): string {
  const categories: Record<string, string> = {
    SPM: "Standard Practices",
    AF: "Airframe",
    PP: "Powerplant",
    SPE: "Avionics",
    ST: "Structures",
  }
  return categories[categoryCode] || categoryCode
}

/**
 * Extrae el rating y categoría del examen basado en sus topics
 */
export function getExamRatingAndCategory(exam: ExamHistoryRecord): {
  rating: string
  category: string
  ratingName: string
  categoryName: string
} | null {
  if (!exam.topics || exam.topics.length === 0) {
    return null
  }

  // Usar el primer topic para determinar rating y categoría
  const firstTopic = exam.topics[0]
  const rating = extractRatingFromCode(firstTopic.code)
  const category = extractCategoryFromCode(firstTopic.code)

  return {
    rating,
    category,
    ratingName: getRatingName(rating),
    categoryName: getCategoryName(category),
  }
}

/**
 * Calcula estadísticas agregadas del historial de exámenes
 */
export function calculateExamStats(examHistory: ExamHistoryRecord[]): ExamStats {
  if (examHistory.length === 0) {
    return {
      totalExams: 0,
      avgScore: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      bestScore: 0,
      worstScore: 0,
    }
  }

  const totalExams = examHistory.length
  const totalQuestions = examHistory.reduce((sum, exam) => sum + exam.question_count, 0)
  const totalCorrect = examHistory.reduce((sum, exam) => sum + exam.correct_answers, 0)
  const avgScore =
    Math.round((examHistory.reduce((sum, exam) => sum + exam.score_percentage, 0) / totalExams) * 10) / 10
  const bestScore = Math.max(...examHistory.map((exam) => exam.score_percentage))
  const worstScore = Math.min(...examHistory.map((exam) => exam.score_percentage))

  return {
    totalExams,
    avgScore,
    totalQuestions,
    totalCorrect,
    bestScore,
    worstScore,
  }
}

/**
 * Formatea el tiempo en segundos a formato legible (Xm Ys)
 */
export function formatExamTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Determina el color según el porcentaje de score
 */
export function getScoreColor(score: number): {
  text: string
  bg: string
  badge: "success" | "warning" | "danger"
} {
  if (score >= 70) {
    return {
      text: "text-green-600 dark:text-green-500",
      bg: "bg-green-600",
      badge: "success",
    }
  }
  if (score >= 50) {
    return {
      text: "text-amber-600 dark:text-amber-500",
      bg: "bg-amber-600",
      badge: "warning",
    }
  }
  return {
    text: "text-red-600 dark:text-red-500",
    bg: "bg-red-600",
    badge: "danger",
  }
}

/**
 * Formatea la fecha de forma legible
 */
export function formatExamDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return "Today"
  }
  if (diffInDays === 1) {
    return "Yesterday"
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`
  }

  // Formato normal para fechas más antiguas
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

/**
 * Ordena el historial por fecha (más reciente primero)
 */
export function sortExamHistoryByDate(examHistory: ExamHistoryRecord[]): ExamHistoryRecord[] {
  return [...examHistory].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
}

/**
 * Agrupa exámenes por fecha (hoy, esta semana, este mes, más antiguo)
 */
export function groupExamsByPeriod(examHistory: ExamHistoryRecord[]): {
  today: ExamHistoryRecord[]
  thisWeek: ExamHistoryRecord[]
  thisMonth: ExamHistoryRecord[]
  older: ExamHistoryRecord[]
} {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const groups = {
    today: [] as ExamHistoryRecord[],
    thisWeek: [] as ExamHistoryRecord[],
    thisMonth: [] as ExamHistoryRecord[],
    older: [] as ExamHistoryRecord[],
  }

  examHistory.forEach((exam) => {
    const examDate = new Date(exam.completed_at)
    if (examDate >= todayStart) {
      groups.today.push(exam)
    } else if (examDate >= weekStart) {
      groups.thisWeek.push(exam)
    } else if (examDate >= monthStart) {
      groups.thisMonth.push(exam)
    } else {
      groups.older.push(exam)
    }
  })

  return groups
}
