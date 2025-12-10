"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type FetchExamDataParams = {
  topicIds: string[]
  questionCount: number
}

export async function fetchExamData({ topicIds, questionCount }: FetchExamDataParams) {
  const supabase = await createSupabaseServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { user: null, questions: [] }
    }

    const { data: questions, error } = await supabase
      .from("questions")
      .select(
        "id, question_text, option_a, option_b, option_c, option_d, correct_answer, topic_id"
      )
      .in("topic_id", topicIds)
      .eq("status", "approved")
      .limit(questionCount)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error("Failed to fetch questions: " + String(error.message || error))
    }

    return { user, questions: questions || [] }
  } catch (err) {
    throw new Error("Failed to fetch exam data: " + String(err))
  }
}
