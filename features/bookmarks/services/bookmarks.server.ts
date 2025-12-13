import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function isBookmarkedByUser(userId: string, questionId: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .single()

  return !!data
}

export function createToggleBookmarkHandler(questionId: string) {
  return async function toggleBookmark() {
    "use server"
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .single()

    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id)
    } else {
      await supabase.from("bookmarks").insert({
        user_id: user.id,
        question_id: questionId,
      })
    }
  }
}