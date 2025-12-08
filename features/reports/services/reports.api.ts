import { createSupabaseServerClient } from "@/lib/supabase/server"
import { markQuestionInconsistent } from "@/lib/db-actions"

export async function getPendingReports() {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:users!reports_reported_by_fkey(id, full_name),
      question:questions(id, question_text, status)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return data || []
}

export async function resolveReport(formData: FormData) {
  "use server"
  const reportId = formData.get("reportId") as string
  const action = formData.get("action") as string
  const supabase = await createSupabaseServerClient()

  if (action === "resolved") {
    await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId)
  } else if (action === "dismissed") {
    await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId)
  }
}

export async function markInconsistentAndResolve(formData: FormData) {
  "use server"
  const questionId = formData.get("questionId") as string
  const notes = formData.get("notes") as string

  await markQuestionInconsistent(questionId, notes)

  await resolveReport(formData)
}
