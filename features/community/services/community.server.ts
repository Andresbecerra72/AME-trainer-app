"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

interface GetCommunityQuestionsParams {
  search?: string
  topic?: string
  difficulty?: string
  sort?: string
}

export async function getCommunityQuestions({
  search = "",
  topic = "all",
  difficulty = "all",
  sort = "recent",
}: GetCommunityQuestionsParams) {
  const supabase = await createSupabaseServerClient()

  // Build query with filters
  let query = supabase
    .from("questions")
    .select(
      `
      *,
      author:profiles!questions_author_id_fkey(id, full_name, avatar_url),
      topic:topics!questions_topic_id_fkey(id, name, code)
    `
    )
    .eq("status", "approved")

  // Apply sorting
  if (sort === "popular") {
    query = query.order("views_count", { ascending: false })
  } else if (sort === "discussed") {
    query = query.order("comments_count", { ascending: false })
  } else if (sort === "unanswered") {
    query = query.order("answers_count", { ascending: true })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  // Apply filters
  if (search) {
    query = query.ilike("question_text", `%${search}%`)
  }

  if (topic && topic !== "all") {
    query = query.eq("topic_id", topic)
  }

  if (difficulty && difficulty !== "all") {
    query = query.eq("difficulty", difficulty)
  }

  const { data: questions, error } = await query

  if (error) {
    console.error("Error fetching community questions:", error)
    return []
  }

  return questions || []
}
