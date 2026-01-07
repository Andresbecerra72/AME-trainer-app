import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCommentsByQuestionId(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("comments")
    .select(`
      *,
      user:profiles!comments_author_id_fkey(id, full_name, avatar_url)
    `)
    .eq("question_id", id)
    .order("created_at", { ascending: true })

  return data || []
}

export function createAddCommentHandler(questionId: string) {
  return async function addComment(formData: FormData) {
    "use server"
    const content = formData.get("content") as string
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !content?.trim()) return

    // Insert comment
    const { error: commentError } = await supabase.from("comments").insert({
      question_id: questionId,
      author_id: user.id,
      content: content.trim(),
    })

    if (!commentError) {
      // The trigger in the database will automatically update comments_count
      // But we revalidate the paths to refresh the UI
      revalidatePath(`/protected/community/questions/${questionId}`)
      revalidatePath(`/protected/community`)
    }
  }
}
