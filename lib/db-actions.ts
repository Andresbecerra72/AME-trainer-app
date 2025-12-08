"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Profile, QuestionWithDetails, Comment, Report, Notification, QuestionStatus, ReportStatus } from "./types"

// Profile actions
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("[v0] Error fetching profile:", error)
    return null
  }
  return data
}

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return getProfile(user.id)
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId)

  if (error) throw error
  revalidatePath("/profile")
}

// Question actions
export async function getQuestions(filters?: {
  topicId?: string
  status?: QuestionStatus
  authorId?: string
  search?: string
  difficulty?: string
  limit?: number
  offset?: number
}): Promise<QuestionWithDetails[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from("questions").select(`
      *,
      topic:topics(*),
      author:profiles!questions_author_id_fkey(*)
    `)

  if (filters?.topicId) query = query.eq("topic_id", filters.topicId)
  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.authorId) query = query.eq("author_id", filters.authorId)
  if (filters?.difficulty) query = query.eq("difficulty", filters.difficulty)
  if (filters?.search) {
    query = query.ilike("question_text", `%${filters.search}%`)
  }

  query = query
    .order("created_at", { ascending: false })
    .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 19))

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching questions:", error)
    return []
  }
  return data || []
}

export async function getQuestion(questionId: string): Promise<QuestionWithDetails | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      topic:topics(*),
      author:profiles(*)
    `)
    .eq("id", questionId)
    .single()

  if (error) {
    console.error("[v0] Error fetching question:", error)
    return null
  }
  return data
}

export async function createQuestion(question: {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation?: string
  topic_id: string
  difficulty: string
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("questions")
    .insert({
      ...question,
      author_id: user.id,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/community")
  return data
}

export async function updateQuestionStatus(questionId: string, status: QuestionStatus, reviewNotes?: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("questions")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", questionId)

  if (error) throw error
  revalidatePath("/admin")
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("questions").delete().eq("id", questionId)

  if (error) throw error
  revalidatePath("/admin")
}

// Vote actions
export async function voteQuestion(questionId: string, voteType: number) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if vote exists
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote
      await supabase.from("votes").delete().eq("id", existingVote.id)
      await updateQuestionVotes(questionId, -voteType)
    } else {
      // Change vote
      await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)
      await updateQuestionVotes(questionId, voteType * 2)
    }
  } else {
    // New vote
    await supabase.from("votes").insert({ user_id: user.id, question_id: questionId, vote_type: voteType })
    await updateQuestionVotes(questionId, voteType)
  }

  revalidatePath("/community")
}

async function updateQuestionVotes(questionId: string, delta: number) {
  const supabase = await createSupabaseServerClient()
  const { data: question } = await supabase.from("questions").select("upvotes, downvotes").eq("id", questionId).single()

  if (question) {
    const updates =
      delta > 0 ? { upvotes: question.upvotes + Math.abs(delta) } : { downvotes: question.downvotes + Math.abs(delta) }

    await supabase.from("questions").update(updates).eq("id", questionId)
  }
}

// Comment actions
export async function getComments(questionId: string): Promise<Comment[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      author:profiles(*)
    `)
    .eq("question_id", questionId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching comments:", error)
    return []
  }
  return data || []
}

export async function createComment(questionId: string, content: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("comments")
    .insert({
      question_id: questionId,
      author_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) throw error

  // Increment comment count
  await supabase.rpc("increment_comment_count", { question_id: questionId })

  revalidatePath("/community")
  return data
}

// Bookmark actions
export async function toggleBookmark(questionId: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .single()

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id)
  } else {
    await supabase.from("bookmarks").insert({ user_id: user.id, question_id: questionId })
  }

  revalidatePath("/community")
}

// Report actions
export async function createReport(data: {
  questionId?: string
  commentId?: string
  reason: string
  description?: string
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    question_id: data.questionId,
    comment_id: data.commentId,
    reason: data.reason,
    description: data.description,
    status: "pending",
  })

  if (error) throw error
  revalidatePath("/community")
}

export async function getReports(status?: ReportStatus): Promise<Report[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from("reports").select("*").order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) {
    console.error("[v0] Error fetching reports:", error)
    return []
  }
  return data || []
}

export async function resolveReport(reportId: string, status: ReportStatus, notes?: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      resolution_notes: notes,
    })
    .eq("id", reportId)

  if (error) throw error
  revalidatePath("/admin")
}

// Notification actions
export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[v0] Error fetching notifications:", error)
    return []
  }
  return data || []
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  revalidatePath("/notifications")
}

export async function createNotification(
  userId: string,
  type: string,
  content: string,
  link?: string,
  actorId?: string,
) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    content,
    link,
    actor_id: actorId,
  })

  if (error) {
    console.error("[v0] Error creating notification:", error)
  }

  revalidatePath("/notifications")
}

// Notification preferences functions
export async function getNotificationPreferences(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching notification preferences:", error)
    return null
  }
  return data
}

export async function updateNotificationPreferences(userId: string, preferences: any) {
  const supabase = await createSupabaseServerClient()

  // Check if preferences exist
  const existing = await getNotificationPreferences(userId)

  if (existing) {
    const { error } = await supabase
      .from("notification_preferences")
      .update({ ...preferences, updated_at: new Date().toISOString() })
      .eq("user_id", userId)

    if (error) throw error
  } else {
    const { error } = await supabase.from("notification_preferences").insert({ user_id: userId, ...preferences })

    if (error) throw error
  }

  revalidatePath("/settings")
  return { success: true }
}

// Topic actions
export async function getTopics() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("topics").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching topics:", error)
    return []
  }
  return data || []
}

export async function createTopic(data: { name: string; description?: string }) {
  const supabase = await createSupabaseServerClient()
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role === "user") {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase.from("topics").insert({
    name: data.name,
    description: data.description,
  })

  if (error) {
    console.error("[v0] Error creating topic:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateTopic(id: string, data: { name?: string; description?: string }) {
  const supabase = await createSupabaseServerClient()
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role === "user") {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase.from("topics").update(data).eq("id", id)

  if (error) {
    console.error("[v0] Error updating topic:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function deleteTopic(id: string) {
  const supabase = await createSupabaseServerClient()
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role === "user") {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase.from("topics").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting topic:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Exam history actions
export async function saveExamHistory(data: {
  topic_ids: string[]
  question_count: number
  correct_answers: number
  incorrect_answers: number
  score_percentage: number
  time_taken: number
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("exam_history").insert({
    user_id: user.id,
    topic_ids: data.topic_ids,
    question_count: data.question_count,
    correct_answers: data.correct_answers,
    incorrect_answers: data.incorrect_answers,
    score_percentage: data.score_percentage,
    time_taken: data.time_taken,
    completed_at: new Date().toISOString(),
  })

  if (error) throw error
  revalidatePath("/analytics")
}

export async function getExamHistory(userId: string, limit = 10) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("exam_history")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching exam history:", error)
    return []
  }
  return data || []
}

export async function getUserStats(userId: string) {
  const supabase = await createSupabaseServerClient()

  const [profile, examHistory, questions, bookmarks] = await Promise.all([
    getProfile(userId),
    getExamHistory(userId, 50),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("status", "approved"),
    supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ])

  const totalExams = examHistory.length
  const totalQuestionsAnswered = examHistory.reduce((sum, exam) => sum + exam.question_count, 0)
  const totalCorrect = examHistory.reduce((sum, exam) => sum + exam.correct_answers, 0)
  const averageScore =
    totalExams > 0 ? examHistory.reduce((sum, exam) => sum + exam.score_percentage, 0) / totalExams : 0

  return {
    profile,
    totalExams,
    totalQuestionsAnswered,
    totalCorrect,
    averageScore: Math.round(averageScore * 10) / 10,
    questionsContributed: questions.count || 0,
    bookmarksCount: bookmarks.count || 0,
  }
}

// Edit suggestion actions
export async function createEditSuggestion(data: {
  questionId: string
  originalData: any
  suggestedData: any
  reason: string
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("edit_suggestions").insert({
    question_id: data.questionId,
    suggested_by: user.id,
    original_data: data.originalData,
    suggested_data: data.suggestedData,
    reason: data.reason,
    status: "pending",
  })

  if (error) throw error
  revalidatePath("/community")
}

export async function getEditSuggestions(questionId?: string) {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("edit_suggestions")
    .select(`
      *,
      question:questions(*),
      suggested_by_user:profiles!user_id(*),
      reviewed_by_user:profiles!reviewed_by(*)
    `)
    .order("created_at", { ascending: false })

  if (questionId) {
    query = query.eq("question_id", questionId)
  }

  const { data, error } = await query
  if (error) {
    console.error("[v0] Error fetching edit suggestions:", error)
    return []
  }
  return data || []
}

export async function reviewEditSuggestion(
  suggestionId: string,
  status: "approved" | "rejected",
  applyChanges = false,
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Get the suggestion
  const { data: suggestion } = await supabase.from("edit_suggestions").select("*").eq("id", suggestionId).single()

  if (!suggestion) throw new Error("Suggestion not found")

  // Update suggestion status
  const { error: updateError } = await supabase
    .from("edit_suggestions")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", suggestionId)

  if (updateError) throw updateError

  // If approved and applyChanges, update the question
  if (status === "approved" && applyChanges) {
    const { error: questionError } = await supabase
      .from("questions")
      .update(suggestion.suggested_data)
      .eq("id", suggestion.question_id)

    if (questionError) throw questionError
  }

  revalidatePath("/admin")
}

export async function markQuestionInconsistent(questionId: string, notes: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("questions")
    .update({
      is_inconsistent: true,
      inconsistent_notes: notes,
    })
    .eq("id", questionId)

  if (error) throw error
  revalidatePath("/admin")
}

export async function mergeQuestions(sourceId: string, targetId: string) {
  const supabase = await createSupabaseServerClient()

  // Copy votes from source to target
  await supabase.rpc("merge_question_votes", { source_id: sourceId, target_id: targetId })

  // Copy comments from source to target
  await supabase.from("comments").update({ question_id: targetId }).eq("question_id", sourceId)

  // Delete source question
  await supabase.from("questions").delete().eq("id", sourceId)

  revalidatePath("/admin")
}

// Community exam actions
export async function getCommunityExams(filters?: {
  createdBy?: string
  isFeatured?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from("community_exams").select(`
      *,
      creator:profiles!created_by(*)
    `)

  if (filters?.createdBy) query = query.eq("created_by", filters.createdBy)
  if (filters?.isFeatured !== undefined) query = query.eq("is_featured", filters.isFeatured)

  query = query
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 19))

  const { data, error } = await query
  if (error) {
    console.error("[v0] Error fetching community exams:", error)
    return []
  }
  return data || []
}

export async function getCommunityExam(examId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("community_exams")
    .select(`
      *,
      creator:profiles!created_by(*)
    `)
    .eq("id", examId)
    .single()

  if (error) {
    console.error("[v0] Error fetching community exam:", error)
    return null
  }
  return data
}

export async function createCommunityExam(data: {
  title: string
  description?: string
  topic_ids: string[]
  question_count: number
  time_limit?: number
  difficulty: string
  is_public?: boolean
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: exam, error } = await supabase
    .from("community_exams")
    .insert({
      ...data,
      created_by: user.id,
      is_public: data.is_public ?? true,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/exams")
  return exam
}

export async function updateCommunityExam(examId: string, updates: any) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("community_exams").update(updates).eq("id", examId).eq("created_by", user.id)

  if (error) throw error
  revalidatePath("/exams")
}

export async function deleteCommunityExam(examId: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("community_exams").delete().eq("id", examId).eq("created_by", user.id)

  if (error) throw error
  revalidatePath("/exams")
}

export async function rateExam(examId: string, rating: number, review?: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Upsert rating
  const { error } = await supabase
    .from("exam_ratings")
    .upsert({
      exam_id: examId,
      user_id: user.id,
      rating,
      review,
    })
    .select()

  if (error) throw error

  // Update exam average rating
  await updateExamRating(examId)
  revalidatePath("/exams")
}

async function updateExamRating(examId: string) {
  const supabase = await createSupabaseServerClient()

  const { data: ratings } = await supabase.from("exam_ratings").select("rating").eq("exam_id", examId)

  if (ratings && ratings.length > 0) {
    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    await supabase
      .from("community_exams")
      .update({
        rating_average: average,
        rating_count: ratings.length,
      })
      .eq("id", examId)
  }
}

export async function getExamRatings(examId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("exam_ratings")
    .select(`
      *,
      user:profiles(*)
    `)
    .eq("exam_id", examId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching exam ratings:", error)
    return []
  }
  return data || []
}

export async function incrementExamTakenCount(examId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: exam } = await supabase.from("community_exams").select("taken_count").eq("id", examId).single()

  if (exam) {
    await supabase
      .from("community_exams")
      .update({ taken_count: (exam.taken_count || 0) + 1 })
      .eq("id", examId)
  }
}

export async function createExamAttempt(
  examId: string,
  userId: string,
  score: number,
  answers: Record<number, string>,
) {
  const supabase = await createSupabaseServerClient()

  try {
    // Insert exam attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("community_exam_attempts")
      .insert({
        exam_id: examId,
        user_id: userId,
        score,
        answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attemptError) {
      console.error("[v0] Error creating exam attempt:", attemptError)
      return { success: false, error: attemptError.message }
    }

    // Increment exam taken count
    await incrementExamTakenCount(examId)

    revalidatePath("/exams")
    return { success: true, data: attempt }
  } catch (error) {
    console.error("[v0] Error in createExamAttempt:", error)
    return { success: false, error: "Failed to create exam attempt" }
  }
}

// User badges actions
export async function getUserBadges(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_badges")
    .select(`
      *,
      badge:badges(*)
    `)
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching user badges:", error)
    return []
  }
  return data || []
}

// System settings functions
export async function getSystemSettings() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("system_settings").select("*").order("setting_key", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching system settings:", error)
    return []
  }
  return data || []
}

export async function updateSystemSetting(key: string, value: any, userId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("system_settings")
    .update({
      setting_value: value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("setting_key", key)

  if (error) {
    console.error("[v0] Error updating system setting:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

// Saved exams functions
export async function saveExam(userId: string, examId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("saved_exams").insert({ user_id: userId, exam_id: examId })

  if (error) {
    console.error("[v0] Error saving exam:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/exams")
  return { success: true }
}

export async function unsaveExam(userId: string, examId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("saved_exams").delete().eq("user_id", userId).eq("exam_id", examId)

  if (error) {
    console.error("[v0] Error unsaving exam:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/exams")
  return { success: true }
}

export async function getSavedExams(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("saved_exams")
    .select(`
      *,
      exam:community_exams(
        *,
        creator:users(id, full_name, avatar_url)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching saved exams:", error)
    return []
  }
  return data || []
}

// Admin stats
export async function getAdminStats() {
  const supabase = await createSupabaseServerClient()

  const [{ count: totalUsers }, { count: totalQuestions }, { count: pendingQuestions }, { count: pendingReports }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("questions").select("*", { count: "exact", head: true }),
      supabase.from("questions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ])

  return {
    totalUsers: totalUsers || 0,
    totalQuestions: totalQuestions || 0,
    pendingQuestions: pendingQuestions || 0,
    pendingReports: pendingReports || 0,
  }
}

// Platform analytics function for super admin
export async function getPlatformAnalytics() {
  const supabase = await createSupabaseServerClient()

  const [
    { count: totalUsers },
    { count: totalQuestions },
    { count: approvedQuestions },
    { count: pendingQuestions },
    { count: rejectedQuestions },
    { count: inconsistentQuestions },
    { count: totalComments },
    { count: totalExams },
    topContributors,
    questionsByTopic,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("questions").select("*", { count: "exact", head: true }),
    supabase.from("questions").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("questions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("questions").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("questions").select("*", { count: "exact", head: true }).eq("is_inconsistent", true),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("community_exams").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, username, reputation, role")
      .order("reputation", { ascending: false })
      .limit(10),
    supabase.from("questions").select("topic_id, topics(name)").eq("status", "approved"),
  ])

  // Count questions by topic
  const topicCounts = (questionsByTopic.data || []).reduce(
    (acc, q: any) => {
      const topicName = q.topics?.name || "Unknown"
      acc[topicName] = (acc[topicName] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalUsers: totalUsers || 0,
    totalQuestions: totalQuestions || 0,
    approvedQuestions: approvedQuestions || 0,
    pendingQuestions: pendingQuestions || 0,
    rejectedQuestions: rejectedQuestions || 0,
    inconsistentQuestions: inconsistentQuestions || 0,
    totalComments: totalComments || 0,
    totalExams: totalExams || 0,
    topContributors: topContributors.data || [],
    questionsByTopic: topicCounts,
  }
}

// Announcement management functions
export async function getActiveAnnouncements() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createAnnouncement(
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "error",
  expiresAt?: string,
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("announcements").insert({
    title,
    message,
    type,
    created_by: user.id,
    expires_at: expiresAt || null,
  })

  if (error) throw error
  revalidatePath("/admin")
}

export async function markAnnouncementViewed(announcementId: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("announcement_views").insert({
    announcement_id: announcementId,
    user_id: user.id,
  })
}

// Study streak and engagement functions
export async function updateStudyStreak(userId: string) {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: streak } = await supabase.from("study_streaks").select("*").eq("user_id", userId).single()

  if (!streak) {
    await supabase.from("study_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    })
    return { currentStreak: 1, longestStreak: 1 }
  }

  const lastDate = new Date(streak.last_activity_date)
  const todayDate = new Date(today)
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  let newCurrentStreak = streak.current_streak
  let newLongestStreak = streak.longest_streak

  if (diffDays === 0) {
    return { currentStreak: streak.current_streak, longestStreak: streak.longest_streak }
  } else if (diffDays === 1) {
    newCurrentStreak = streak.current_streak + 1
    newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak)
  } else {
    newCurrentStreak = 1
  }

  await supabase
    .from("study_streaks")
    .update({
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  return { currentStreak: newCurrentStreak, longestStreak: newLongestStreak }
}

export async function getStudyStreak(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from("study_streaks").select("*").eq("user_id", userId).single()

  return data || { current_streak: 0, longest_streak: 0 }
}

export async function getQuestionOfDay() {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: qotd } = await supabase
    .from("question_of_day")
    .select(
      `
      *,
      question:questions(
        *,
        topic:topics(id, name, code),
        author:users(id, full_name, avatar_url)
      )
    `,
    )
    .eq("date", today)
    .single()

  if (!qotd) {
    const { data: randomQuestion } = await supabase
      .from("questions")
      .select(
        `
        *,
        topic:topics(id, name, code),
        author:users(id, full_name, avatar_url)
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100)

    if (randomQuestion && randomQuestion.length > 0) {
      const selected = randomQuestion[Math.floor(Math.random() * randomQuestion.length)]

      await supabase.from("question_of_day").insert({
        question_id: selected.id,
        date: today,
      })

      return { question: selected, date: today }
    }
  }

  return qotd
}

export async function trackDailyActivity(userId: string, activityType: string) {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: existing } = await supabase
    .from("daily_activities")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .single()

  const updates: Record<string, number> = {}
  if (activityType === "question_answered") updates.questions_answered = (existing?.questions_answered || 0) + 1
  if (activityType === "exam_taken") updates.exams_taken = (existing?.exams_taken || 0) + 1
  if (activityType === "question_contributed")
    updates.questions_contributed = (existing?.questions_contributed || 0) + 1
  if (activityType === "comment_made") updates.comments_made = (existing?.comments_made || 0) + 1

  if (existing) {
    await supabase.from("daily_activities").update(updates).eq("id", existing.id)
  } else {
    await supabase.from("daily_activities").insert({
      user_id: userId,
      activity_date: today,
      ...updates,
    })
  }

  await updateStudyStreak(userId)
}

// Recommendation engine functions
export async function getRecommendedQuestions(userId: string, limit = 10) {
  const supabase = await createSupabaseServerClient()

  // Get user's exam history
  const examHistory = await getExamHistory(userId, 20)

  const topicPerformance: Record<string, { correct: number; total: number }> = {}

  for (const exam of examHistory) {
    for (const topicId of exam.topic_ids || []) {
      if (!topicPerformance[topicId]) {
        topicPerformance[topicId] = { correct: 0, total: 0 }
      }
    }
  }

  const weakTopics = Object.entries(topicPerformance)
    .filter(([_, perf]) => perf.total > 0 && perf.correct / perf.total < 0.7)
    .map(([topicId]) => topicId)

  // Get answered questions
  const { data: userAnswers } = await supabase
    .from("user_answers")
    .select("question_id")
    .eq("user_id", userId)

  const answeredIds = (userAnswers || []).map((a) => a.question_id)

  // Build recommendation query
  let query = supabase
    .from("questions")
    .select(`
      *,
      topic:topics(*),
      author:profiles!questions_author_id_fkey (*)
    `)
    .eq("status", "approved")

  if (answeredIds.length > 0) {
    query = query.not("id", "in", `(${answeredIds.join(",")})`)
  }

  if (weakTopics.length > 0) {
    query = query.in("topic_id", weakTopics)
  }

  query = query.order("upvotes", { ascending: false }).limit(limit)

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching recommended questions:", error)
    return []
  }

  return data || []
}


export async function getRecentPlatformActivity(limit = 20) {
  const supabase = await createSupabaseServerClient()

  const [recentQuestions, recentComments, recentExams] = await Promise.all([
    supabase
      .from("questions")
      .select(`
        id,
        question_text,
        created_at,
        author:profiles(id, full_name, avatar_url)
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        author:profiles(id, full_name, avatar_url),
        question:questions(id, question_text)
      `)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("community_exams")
      .select(`
        id,
        title,
        created_at,
        creator:profiles!created_by(id, full_name, avatar_url)
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const activities = [
    ...(recentQuestions.data || []).map((q) => ({
      type: "question" as const,
      id: q.id,
      text: q.question_text,
      user: q.author,
      timestamp: q.created_at,
    })),
    ...((recentComments.data || []) as any[]).map((c) => ({
      type: "comment" as const,
      id: c.id,
      text: c.content,
      questionText: c.question?.question_text,
      questionId: c.question?.id,
      user: c.author,
      timestamp: c.created_at,
    })),
    ...(recentExams.data || []).map((e) => ({
      type: "exam" as const,
      id: e.id,
      text: e.title,
      user: e.creator,
      timestamp: e.created_at,
    })),
  ]

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return activities.slice(0, limit)
}

export async function getUserActivity(userId: string, limit = 20) {
  const supabase = await createSupabaseServerClient()

  const [questions, comments, votes, editSuggestions] = await Promise.all([
    supabase
      .from("questions")
      .select("id, question_text, created_at, status, upvotes")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        question:questions(id, question_text)
      `)
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("votes")
      .select(`
        id,
        vote_type,
        created_at,
        question:questions(id, question_text)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("edit_suggestions")
      .select(`
        id,
        created_at,
        status,
        question:questions(id, question_text)
      `)
      .eq("suggested_by", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const activities = [
    ...(questions.data || []).map((q) => ({
      type: "question_created" as const,
      id: q.id,
      text: q.question_text,
      status: q.status,
      upvotes: q.upvotes,
      timestamp: q.created_at,
    })),
    ...((comments.data || []) as any[]).map((c) => ({
      type: "comment_added" as const,
      id: c.id,
      text: c.content,
      questionText: c.question?.question_text,
      questionId: c.question?.id,
      timestamp: c.created_at,
    })),
    ...((votes.data || []) as any[]).map((v) => ({
      type: "voted" as const,
      id: v.id,
      voteType: v.vote_type,
      questionText: v.question?.question_text,
      questionId: v.question?.id,
      timestamp: v.created_at,
    })),
    ...((editSuggestions.data || []) as any[]).map((e) => ({
      type: "edit_suggested" as const,
      id: e.id,
      status: e.status,
      questionText: e.question?.question_text,
      questionId: e.question?.id,
      timestamp: e.created_at,
    })),
  ]

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return activities.slice(0, limit)
}

// Question collections functions
export async function getCollections(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("question_collections")
    .select("*, question_count:collection_questions(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching collections:", error)
    return []
  }
  return data || []
}

export async function getCollection(collectionId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("question_collections")
    .select(`
      *,
      questions:collection_questions(
        question:questions(
          *,
          topic:topics(*),
          author:profiles(*)
        )
      )
    `)
    .eq("id", collectionId)
    .single()

  if (error) {
    console.error("[v0] Error fetching collection:", error)
    return null
  }
  return data
}

export async function createCollection(data: {
  name: string
  description?: string
  is_public?: boolean
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: collection, error } = await supabase
    .from("question_collections")
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description,
      is_public: data.is_public ?? false,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/collections")
  return collection
}

export async function updateCollection(collectionId: string, updates: any) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("question_collections")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", collectionId)

  if (error) throw error
  revalidatePath("/collections")
}

export async function deleteCollection(collectionId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("question_collections").delete().eq("id", collectionId)

  if (error) throw error
  revalidatePath("/collections")
}

export async function addQuestionToCollection(collectionId: string, questionId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("collection_questions")
    .insert({ collection_id: collectionId, question_id: questionId })

  if (error) throw error
  revalidatePath("/collections")
}

export async function removeQuestionFromCollection(collectionId: string, questionId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("collection_questions")
    .delete()
    .eq("collection_id", collectionId)
    .eq("question_id", questionId)

  if (error) throw error
  revalidatePath("/collections")
}

// Weekly challenges functions
export async function getActiveChallenge() {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching active challenge:", error)
    return null
  }
  return data
}

export async function getChallengeLeaderboard(challengeId: string, limit = 10) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("challenge_attempts")
    .select(`
      *,
      user:profiles(*)
    `)
    .eq("challenge_id", challengeId)
    .order("score", { ascending: false })
    .order("time_taken", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching challenge leaderboard:", error)
    return []
  }
  return data || []
}

export async function submitChallengeAttempt(data: {
  challengeId: string
  score: number
  totalQuestions: number
  timeTaken: number
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("challenge_attempts").insert({
    challenge_id: data.challengeId,
    user_id: user.id,
    score: data.score,
    total_questions: data.totalQuestions,
    time_taken: data.timeTaken,
  })

  if (error) throw error
  revalidatePath("/challenges")
  return { success: true }
}

export async function createChallenge(data: {
  title: string
  description?: string
  topicId?: string
  questionCount: number
  startDate: string
  endDate: string
}) {
  const supabase = await createSupabaseServerClient()
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role === "user") {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase.from("weekly_challenges").insert({
    title: data.title,
    description: data.description,
    topic_id: data.topicId,
    question_count: data.questionCount,
    start_date: data.startDate,
    end_date: data.endDate,
    is_active: true,
  })

  if (error) {
    console.error("[v0] Error creating challenge:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/challenges")
  return { success: true }
}
