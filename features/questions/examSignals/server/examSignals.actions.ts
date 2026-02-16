"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

const QUERY_CHUNK_SIZE = 100

function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items]
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

interface ExamSignalPayload {
  examCode?: string | null
  seenMonth?: string | null
  seenYear?: number | null
  confidence?: number | null
}

/**
 * Get signal count from questions.exam_signal_count (efficient, uses trigger)
 */
export async function getSignalCount(questionId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from("questions")
      .select("exam_signal_count")
      .eq("id", questionId)
      .single()

    if (error) throw error

    return data?.exam_signal_count ?? 0
  } catch (error) {
    throw new Error(`Failed to get exam signal count: ${String(error)}`)
  }
}

export async function hasUserSignaled(questionId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
      .from("question_exam_signals")
      .select("id")
      .eq("question_id", questionId)
      .eq("user_id", user.id)
      .limit(1)

    if (error) throw error

    return (data?.length ?? 0) > 0
  } catch (error) {
    throw new Error(`Failed to check exam signal: ${String(error)}`)
  }
}

/**
 * Get signal counts for multiple questions (efficient batch read from questions table)
 */
export async function getSignalCountsForQuestions(questionIds: string[]): Promise<Record<string, number>> {
  const supabase = await createSupabaseServerClient()

  if (!questionIds.length) return {}

  try {
    const counts: Record<string, number> = {}
    for (const id of questionIds) counts[id] = 0

    const chunks = chunkArray(questionIds, QUERY_CHUNK_SIZE)
    const responses = await Promise.all(
      chunks.map((ids) =>
        supabase
          .from("questions")
          .select("id, exam_signal_count")
          .in("id", ids)
      )
    )

    for (const response of responses) {
      if (response.error) throw response.error
      for (const row of response.data ?? []) {
        counts[row.id] = row.exam_signal_count ?? 0
      }
    }

    return counts
  } catch (error) {
    throw new Error(`Failed to get exam signal counts: ${String(error)}`)
  }
}

/**
 * Get detailed exam signal data with user reputation for weighted scoring
 * Returns count from questions table + calculates average reputation from signals
 */
export async function getSignalDetailsForQuestion(questionId: string): Promise<{
  count: number
  averageReputation: number
}> {
  const supabase = await createSupabaseServerClient()

  try {
    // Get count from questions table (efficient)
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("exam_signal_count")
      .eq("id", questionId)
      .single()

    if (questionError) throw questionError

    const count = question?.exam_signal_count ?? 0
    if (count === 0) return { count: 0, averageReputation: 0 }

    // Get reputation data from signals (only when count > 0)
    const { data, error } = await supabase
      .from("question_exam_signals")
      .select(
        `
        id,
        user_id,
        profiles!question_exam_signals_user_id_fkey (
          reputation
        )
      `
      )
      .eq("question_id", questionId)

    if (error) throw error

    const reputations = (data ?? [])
      .map((signal: any) => signal.profiles?.reputation ?? 0)
      .filter((rep: number) => rep > 0)

    const averageReputation = reputations.length > 0 
      ? reputations.reduce((sum: number, rep: number) => sum + rep, 0) / reputations.length 
      : 0

    return { count, averageReputation }
  } catch (error) {
    throw new Error(`Failed to get signal details: ${String(error)}`)
  }
}

/**
 * Get detailed exam signal data for multiple questions (batched)
 * Efficient: reads counts from questions table, only fetches reputation when needed
 */
export async function getSignalDetailsForQuestions(questionIds: string[]): Promise<
  Record<string, { count: number; averageReputation: number }>
> {

  console.log("Fetching signal details for questions:", questionIds) // Debug log
  const supabase = await createSupabaseServerClient()

  if (!questionIds.length) return {}

  try {
    // Step 1: Get counts from questions table (very fast)
    const result: Record<string, { count: number; averageReputation: number }> = {}

    // Initialize all question IDs
    for (const id of questionIds) {
      result[id] = { count: 0, averageReputation: 0 }
    }

    const questionChunks = chunkArray(questionIds, QUERY_CHUNK_SIZE)
    const questionResponses = await Promise.all(
      questionChunks.map((ids) =>
        supabase
          .from("questions")
          .select("id, exam_signal_count")
          .in("id", ids)
      )
    )

    console.log("Question responses for signal details:", questionResponses) // Debug log

    const questions: { id: string; exam_signal_count: number | null }[] = []
    for (const response of questionResponses) {
      if (response.error) throw response.error
      for (const row of response.data ?? []) {
        questions.push(row)
      }
    }

    console.log("Questions with signal counts:", questions) // Debug log

    // Update counts from questions table
    const questionsWithSignals = (questions ?? []).filter((q) => (q.exam_signal_count ?? 0) > 0)
    for (const question of questions ?? []) {
      result[question.id].count = question.exam_signal_count ?? 0
    }

    // Step 2: Only fetch reputation data for questions with signals
    if (questionsWithSignals.length === 0) return result

    const questionIdsWithSignals = questionsWithSignals.map((q) => q.id)

    const signalChunks = chunkArray(questionIdsWithSignals, QUERY_CHUNK_SIZE)
    const signalResponses = await Promise.all(
      signalChunks.map((ids) =>
        supabase
          .from("question_exam_signals")
          .select(
            `
        question_id,
        user_id,
        profiles!question_exam_signals_user_id_fkey (
          reputation
        )
      `
          )
          .in("question_id", ids)
      )
    )

    const data: any[] = []
    for (const response of signalResponses) {
      if (response.error) throw response.error
      for (const row of response.data ?? []) {
        data.push(row)
      }
    }

    // Group signals by question
    const signalsByQuestion: Record<string, any[]> = {}
    for (const signal of data ?? []) {
      if (!signalsByQuestion[signal.question_id]) {
        signalsByQuestion[signal.question_id] = []
      }
      signalsByQuestion[signal.question_id].push(signal)
    }

    // Calculate average reputation per question
    for (const [questionId, signals] of Object.entries(signalsByQuestion)) {
      const reputations = signals
        .map((s: any) => s.profiles?.reputation ?? 0)
        .filter((rep: number) => rep > 0)

      const averageReputation =
        reputations.length > 0 ? reputations.reduce((sum: number, rep: number) => sum + rep, 0) / reputations.length : 0

      result[questionId].averageReputation = averageReputation
    }

    return result
  } catch (error) {
    throw new Error(`Failed to get signal details for questions: ${String(error)}`)
  }
}

export async function getUserSignalStatusesForQuestions(
  questionIds: string[]
): Promise<Record<string, boolean>> {
  const supabase = await createSupabaseServerClient()

  if (!questionIds.length) return {}

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const result: Record<string, boolean> = {}
    for (const id of questionIds) result[id] = false

    if (!user) return result

    const chunks = chunkArray(questionIds, QUERY_CHUNK_SIZE)
    const responses = await Promise.all(
      chunks.map((ids) =>
        supabase
          .from("question_exam_signals")
          .select("question_id")
          .eq("user_id", user.id)
          .in("question_id", ids)
      )
    )

    for (const response of responses) {
      if (response.error) throw response.error
      for (const row of response.data ?? []) {
        result[row.question_id] = true
      }
    }

    return result
  } catch (error) {
    throw new Error(`Failed to get user exam signals: ${String(error)}`)
  }
}

export async function toggleUserSignal(
  questionId: string,
  payload?: ExamSignalPayload
): Promise<{ active: boolean; count: number }> {
  const supabase = await createSupabaseServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data: existing, error: existingError } = await supabase
      .from("question_exam_signals")
      .select("id")
      .eq("question_id", questionId)
      .eq("user_id", user.id)
      .limit(1)

    if (existingError) throw existingError

    if (existing && existing.length > 0) {
      // Delete signal (trigger will auto-decrement count)
      const { error: deleteError } = await supabase
        .from("question_exam_signals")
        .delete()
        .eq("id", existing[0].id)

      if (deleteError) throw deleteError

      // Read updated count from questions table
      const count = await getSignalCount(questionId)
      return { active: false, count }
    }

    const examCode = payload?.examCode?.trim() || null
    const confidenceRaw = payload?.confidence
    const confidence =
      typeof confidenceRaw === "number" && confidenceRaw >= 1 && confidenceRaw <= 5 ? confidenceRaw : null


    // Insert signal (trigger will auto-increment count)
    const { error: insertError } = await supabase.from("question_exam_signals").insert({
      user_id: user.id,
      question_id: questionId,
      exam_code: examCode,
      confidence,
    })

    if (insertError) throw insertError

    // Read updated count from questions table
    const count = await getSignalCount(questionId)
    return { active: true, count }
  } catch (error) {
    throw new Error(`Failed to toggle exam signal: ${String(error)}`)
  }
}
