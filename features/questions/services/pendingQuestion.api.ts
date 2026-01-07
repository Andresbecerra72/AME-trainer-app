"use server"

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
  try {
    const questionId = formData.get("questionId") as string
    const authorId = formData.get("authorId") as string
    const supabase = await createSupabaseServerClient()
    const { user } = await getSession()

    const { error: updateError } = await supabase
      .from("questions")
      .update({ 
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
        status: "approved"
      })
      .eq("id", questionId)

    if (updateError) {
      console.error("Error approving question:", updateError)
      return { success: false, error: updateError.message }
    }

    // Send notification to author
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

    // Revalidate pages
    revalidatePath("/admin/pending")
    revalidatePath("/protected/community")
    
    return { success: true }
  } catch (error) {
    console.error("Error in approveQuestion:", error)
    return { success: false, error: String(error) }
  }
}

export async function rejectQuestion(formData: FormData) {
  try {
    const questionId = formData.get("questionId") as string
    const authorId = formData.get("authorId") as string
    const reason = (formData.get("reason") as string) || "No reason provided"
    const supabase = await createSupabaseServerClient()

    const { error: updateError } = await supabase
      .from("questions")
      .update({
        status: "rejected",
        rejection_reason: reason,
      })
      .eq("id", questionId)

    if (updateError) {
      console.error("Error rejecting question:", updateError)
      return { success: false, error: updateError.message }
    }

    // Send notification to author
    if (authorId) {
      await supabase
        .from("notifications")
        .insert({
          user_id: authorId,
          type: "question_rejected",
          title: "Question Rejected",
          message: `Your question was rejected: ${reason}`,
          link: `/protected/community/questions/${questionId}`,
        })
    }

    // Revalidate pages
    revalidatePath("/admin/pending")
    revalidatePath("/protected/community")
    
    return { success: true }
  } catch (error) {
    console.error("Error in rejectQuestion:", error)
    return { success: false, error: String(error) }
  }
}
