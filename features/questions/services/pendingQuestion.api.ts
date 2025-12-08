import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getPendingQuestions() {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("questions")
    .select(`
      *,
      author:users(id, full_name, avatar_url),
      topic:topics(id, name, code)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return data || []
}

export async function approveQuestion(formData: FormData) {
  "use server"
  const questionId = formData.get("questionId") as string
  const supabase = await createSupabaseServerClient()

  await supabase.from("questions").update({ status: "approved" }).eq("id", questionId)

  // Lookup author_id so we can create the notification (keeps form minimal)
  const { data: q } = await supabase.from("questions").select("author_id").eq("id", questionId).single()
  const authorId = q?.author_id

  if (authorId) {
    await supabase.from("notifications").insert({
      user_id: authorId,
      type: "question_approved",
      content: "Your question has been approved!",
      link: `/community/questions/${questionId}`,
    })
  }
}

export async function rejectQuestion(formData: FormData) {
  "use server"
  const questionId = formData.get("questionId") as string
  const reason = (formData.get("reason") as string) || null
  const supabase = await createSupabaseServerClient()

  await supabase
    .from("questions")
    .update({
      status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", questionId)

  // Lookup author_id to notify the user
  const { data: q } = await supabase.from("questions").select("author_id").eq("id", questionId).single()
  const authorId = q?.author_id

  if (authorId) {
    await supabase.from("notifications").insert({
      user_id: authorId,
      type: "question_rejected",
      content: `Your question was rejected: ${reason || "No reason provided"}`,
      link: `/community/questions/${questionId}`,
    })
  }
}
