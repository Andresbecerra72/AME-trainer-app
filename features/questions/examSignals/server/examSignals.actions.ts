"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getSignalCount(questionId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()

  try {
    const { count, error } = await supabase
      .from("question_exam_signals")
      .select("id", { count: "exact", head: true })
      .eq("question_id", questionId)

    if (error) throw error

    return count ?? 0
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

export async function getSignalCountsForQuestions(questionIds: string[]): Promise<Record<string, number>> {
  const supabase = await createSupabaseServerClient()

  if (!questionIds.length) return {}

  try {
    const { data, error } = await supabase
      .from("question_exam_signals")
      .select("question_id")
      .in("question_id", questionIds)

    if (error) throw error

    const counts: Record<string, number> = {}
    for (const id of questionIds) counts[id] = 0

    for (const row of data ?? []) {
      counts[row.question_id] = (counts[row.question_id] ?? 0) + 1
    }

    return counts
  } catch (error) {
    throw new Error(`Failed to get exam signal counts: ${String(error)}`)
  }
}

export async function toggleUserSignal(questionId: string): Promise<{ active: boolean; count: number }> {
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
      const { error: deleteError } = await supabase
        .from("question_exam_signals")
        .delete()
        .eq("id", existing[0].id)

      if (deleteError) throw deleteError

      const count = await getSignalCount(questionId)
      return { active: false, count }
    }

    const { error: insertError } = await supabase.from("question_exam_signals").insert({
      user_id: user.id,
      question_id: questionId,
    })

    if (insertError) throw insertError

    const count = await getSignalCount(questionId)
    return { active: true, count }
  } catch (error) {
    throw new Error(`Failed to toggle exam signal: ${String(error)}`)
  }
}
