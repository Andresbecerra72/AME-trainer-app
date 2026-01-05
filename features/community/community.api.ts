"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface QuestionFormData {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation: string
  topic_id: string
  difficulty: "easy" | "medium" | "hard"
}

export interface QuestionFilters {
  search?: string
  topic?: string
  difficulty?: string
  sort?: "recent" | "popular" | "unanswered"
  status?: "pending" | "approved" | "rejected"
  limit?: number
  offset?: number
}

/**
 * Create a new community question
 */
export async function createCommunityQuestion(data: QuestionFormData) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    // Prepare insert data with proper structure
    const insertData = {
      question_text: data.question_text,
      option_a: data.option_a,
      option_b: data.option_b,
      option_c: data.option_c,
      option_d: data.option_d,
      correct_answer: data.correct_answer,
      explanation: data.explanation || null,
      topic_id: data.topic_id,
      difficulty: data.difficulty,
      author_id: user.id,
      status: "pending",
    }

    const { data: question, error } = await supabase
      .from("questions")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Error creating question:", error)
      throw new Error(error.message || "Failed to create question")
    }

    revalidatePath("/protected/community")
    return question
  } catch (error: any) {
    console.error("createCommunityQuestion error:", error)
    throw new Error(error.message || "Failed to create question")
  }
}

/**
 * Update an existing community question
 */
export async function updateCommunityQuestion(questionId: string, data: Partial<QuestionFormData>) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }

  // Check if user is the author or admin
  const { data: question } = await supabase
    .from("questions")
    .select("author_id")
    .eq("id", questionId)
    .single()

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAuthor = question?.author_id === user.id
  const isAdmin = userProfile?.role === "admin" || userProfile?.role === "super_admin"

  if (!isAuthor && !isAdmin) {
    throw new Error("Unauthorized to edit this question")
  }

  const { data: updated, error } = await supabase
    .from("questions")
    .update({
      ...data,
      // Admins can approve directly, others need review
      ...(isAdmin ? {} : { status: "pending" }),
    })
    .eq("id", questionId)
    .select()
    .single()

  if (error) {
    console.error("Error updating question:", error)
    throw new Error("Failed to update question")
  }

  revalidatePath("/protected/community")
  revalidatePath(`/protected/community/questions/${questionId}`)
  return updated
}

/**
 * Delete a community question
 */
export async function deleteCommunityQuestion(questionId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }

  // Check if user is the author or admin
  const { data: question } = await supabase
    .from("questions")
    .select("author_id")
    .eq("id", questionId)
    .single()

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAuthor = question?.author_id === user.id
  const isAdmin = userProfile?.role === "admin" || userProfile?.role === "super_admin"

  if (!isAuthor && !isAdmin) {
    throw new Error("Unauthorized to delete this question")
  }

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId)

  if (error) {
    console.error("Error deleting question:", error)
    throw new Error("Failed to delete question")
  }

  revalidatePath("/protected/community")
}

/**
 * Get community questions with filters
 */
export async function getCommunityQuestions(filters: QuestionFilters = {}) {
  const supabase = await createSupabaseServerClient()
  
  let query = supabase
    .from("questions")
    .select(`
      *,
      topic:topics(id, name, code),
      author:profiles!author_id(id, display_name, email, avatar_url),
      _count_votes:votes(count),
      _count_comments:comments(count)
    `)

  // Apply filters
  if (filters.search) {
    query = query.ilike("question_text", `%${filters.search}%`)
  }

  if (filters.topic && filters.topic !== "all") {
    query = query.eq("topic_id", filters.topic)
  }

  if (filters.difficulty && filters.difficulty !== "all") {
    query = query.eq("difficulty", filters.difficulty)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  } else {
    // Default: show only approved questions
    query = query.eq("status", "approved")
  }

  // Apply sorting
  switch (filters.sort) {
    case "popular":
      query = query.order("votes_count", { ascending: false })
      break
    case "unanswered":
      query = query.order("comments_count", { ascending: true })
      break
    case "recent":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  // Pagination
  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching questions:", error)
    return []
  }

  return data || []
}

/**
 * Get a single question by ID with full details
 */
export async function getCommunityQuestion(questionId: string) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      topic:topics(id, name, code),
      author:profiles!author_id(id, display_name, email, avatar_url),
      votes:votes(user_id, vote_type),
      comments:comments(
        id,
        content,
        created_at,
        user:profiles(id, display_name, email, avatar_url)
      )
    `)
    .eq("id", questionId)
    .single()

  if (error) {
    console.error("Error fetching question:", error)
    return null
  }

  return data
}
