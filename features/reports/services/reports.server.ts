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

    await supabase.from("reports").insert({
      question_id: questionId,
      reported_id: user.id,
      reason,
      description: description || null,
    })
  }
}