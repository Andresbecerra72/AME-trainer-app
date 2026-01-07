"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCommunityQuestion } from "@/features/community/community.api"
import { redirect } from "next/navigation"

export interface EditQuestionPermissions {
  canEdit: boolean
  isAuthor: boolean
  isAdmin: boolean
  question: any
}

/**
 * Check if the current user can edit a specific question
 * Returns permissions and question data
 */
export async function checkEditPermissions(questionId: string): Promise<EditQuestionPermissions | null> {
  const supabase = await createSupabaseServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch question
  const question = await getCommunityQuestion(questionId)
  
  if (!question) {
    return null
  }

  // Get user profile for role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAuthor = question.author_id === user.id
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"
  const canEdit = isAuthor || isAdmin

  return {
    canEdit,
    isAuthor,
    isAdmin,
    question,
  }
}
