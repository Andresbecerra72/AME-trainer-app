import { getSession } from "@/features/auth/services/getSession"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPendingQuestions() {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("questions")
    .select(`
      *,
     author:profiles!questions_author_id_fkey(id, full_name, avatar_url),
     topic:topics!questions_topic_id_fkey(id, name, code)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })


  return data || []
}

export async function approveQuestion(formData: FormData) {
  "use server"
  const questionId = formData.get("questionId") as string
  const authorId = formData.get("authorId") as string
  const supabase = await createSupabaseServerClient()
  const { user } = await getSession()

  await supabase
    .from("questions")
    .update({ 
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id || null,
      status: "approved"
     })
    .eq("id", questionId)


  if (authorId) {
    await supabase
    .from("notifications")
    .insert({
      user_id: authorId,
      type: "question_approved",
      message: "Your question has been approved!",
      link: `/protected/community/questions/${questionId}`,
    })
  }

  // Revalidate the admin pending page so the server component fetches fresh data
  try {
    revalidatePath("/admin/pending")
  } catch (err) {
    console.error("Failed to revalidate /admin/pending:", err)
  }
}

export async function rejectQuestion(formData: FormData) {
  "use server"
  const questionId = formData.get("questionId") as string
  const reason = (formData.get("reason") as string) || null
  const supabase = await createSupabaseServerClient()


  const { error } = await supabase
    .from("questions")
    .update({
      status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", questionId)

  console.log("Rejection error:", error)
  // Lookup author_id to notify the user
  const { data: q } = await supabase.from("questions").select("author_id").eq("id", questionId).single()
  const authorId = q?.author_id

  if (authorId) {
    const { error} = await supabase.from("notifications").insert({
      user_id: authorId,
      type: "question_rejected",
      title: "Question Rejected",
      message: `Your question was rejected: ${reason || "No reason provided"}`,
      link: `/protected/community/questions/${questionId}`,
    })
      console.log("notifications error:", error)
  }

  // Revalidate the admin pending page so the server component fetches fresh data
  try {
    revalidatePath("/admin/pending")
  } catch (err) {
    console.error("Failed to revalidate /admin/pending:", err)
  }
}
