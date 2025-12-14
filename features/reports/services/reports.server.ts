import { createSupabaseServerClient } from "@/lib/supabase/server"

export function createReportQuestionHandler(questionId: string) {
  return async function reportQuestion(formData: FormData) {
    "use server"
    const reason = formData.get("reason") as string
    const description = formData.get("description") as string
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !reason) return

    const result = await supabase.from("reports").insert({
      question_id: questionId,
      reporter_id: user.id,
      reason,
      description: description || null,
      status: "pending",
      user_id: user.id,
    })
  }
}

export async function hasUserReportedQuestion(userId: string, questionId: string): Promise<boolean> {
  "use server"
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", userId)
    .eq("question_id", questionId)
    .limit(1)
    .single()

  return !!data
}

export async function getQuestionReportsCount(questionId: string): Promise<number> {
  "use server"
  const supabase = await createSupabaseServerClient()
  
  const { count, error } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("question_id", questionId)

  return count || 0
}