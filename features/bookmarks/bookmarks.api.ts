"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface BookmarkedQuestion {
  id: string
  created_at: string
  question: {
    id: string
    question_text: string
    upvotes: number
    comment_count: number
    created_at: string
    status: string
    author: {
      id: string
      display_name: string | null
      avatar_url: string | null
    } | null
    topic: {
      id: string
      name: string
      code: string | null
    } | null
  }
}

/**
 * Get user's bookmarked questions
 */
export async function getUserBookmarks(userId: string): Promise<BookmarkedQuestion[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      id,
      created_at,
      question:questions!inner(
        id,
        question_text,
        upvotes,
        comment_count,
        created_at,
        status,
        author:profiles!questions_author_id_fkey(id, display_name, avatar_url),
        topic:topics!questions_topic_id_fkey(id, name, code)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookmarks:", error)
    return []
  }

  return (data || []) as unknown as BookmarkedQuestion[]
}

/**
 * Check if a question is bookmarked by user
 */
export async function isQuestionBookmarked(
  userId: string,
  questionId: string
): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .single()

  return !!data
}

/**
 * Toggle bookmark for a question
 */
export async function toggleBookmark(questionId: string): Promise<{ success: boolean; isBookmarked: boolean }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .single()

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id)

    if (error) {
      console.error("Error removing bookmark:", error)
      throw new Error("Failed to remove bookmark")
    }

    revalidatePath("/protected/bookmarks")
    return { success: true, isBookmarked: false }
  } else {
    // Add bookmark
    const { error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        question_id: questionId,
      })

    if (error) {
      console.error("Error adding bookmark:", error)
      throw new Error("Failed to add bookmark")
    }

    revalidatePath("/protected/bookmarks")
    return { success: true, isBookmarked: true }
  }
}

/**
 * Get bookmark count for user
 */
export async function getBookmarkCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()

  const { count, error } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) {
    console.error("Error counting bookmarks:", error)
    return 0
  }

  return count || 0
}
