"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getBadgeLevel, type BadgeLevel } from "../utils/profile.utils"

// GET PROFILE
export async function getProfile() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return { data, error }
}

// UPDATE PROFILE (name, bio, avatar_url)
export async function updateProfile(updates: {
  full_name?: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single()

  return { data, error }
}

// AVATAR UPLOAD
export async function uploadAvatar(file: File) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const filePath = `avatars/${user.id}-${Date.now()}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file)

  if (uploadError) return { error: uploadError.message }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath)

  const publicUrl = publicUrlData?.publicUrl

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)

  return {
    avatar_url: publicUrl,
    error: updateError?.message,
  }
}
// ADMIN: UPDATE USER ROLE
export async function updateUserRole(formData: FormData) {
  const userId = formData.get("userId") as string
  const newRole = formData.get("role") as string
  const supabase = await createSupabaseServerClient()

  await supabase.from("profiles").update({ role: newRole }).eq("id", userId)
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get("userId") as string
  const supabase = await createSupabaseServerClient()

  // Remove the profile row. If you need to also remove auth user, use a server-side admin API.
  await supabase.from("profiles").delete().eq("id", userId)
}

// GET USER PROFILE DATA WITH STATS
import { getUserQuestions } from "@/features/questions/services/question.api"
import { getUserBadges } from "@/lib/db-actions"

export interface ProfileStats {
  reputation: number
  totalQuestions: number
  totalUpvotes: number
  totalDiscussions: number
}

export interface ProfileData {
  profile: {
    id: string
    display_name: string | null
    email: string | null
    avatar_url: string | null
    reputation: number
    role: string
  }
  stats: ProfileStats
  badgeLevel: BadgeLevel
  questions: any[]
  badges: any[]
}

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  const supabase = await createSupabaseServerClient()
  
  // Validate userId
  if (!userId || userId.trim() === "") {
    console.error("Invalid userId provided to getProfileData")
    return null
  }
  
  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url, reputation, role")
    .eq("id", userId)
    .single()

  if (profileError) {
    console.error("Error fetching profile:", {
      error: profileError,
      userId,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code,
    })
    return null
  }

  if (!profile) {
    console.error("No profile found for userId:", userId)
    return null
  }

  // Get user questions
  const { data: userQuestions } = await getUserQuestions(userId)
  const questions = userQuestions || []

  // Get user badges
  const badges = await getUserBadges(userId)

  // Calculate stats
  const stats: ProfileStats = {
    reputation: profile.reputation || 0,
    totalQuestions: questions.length,
    totalUpvotes: questions.reduce((sum: number, q: any) => sum + (q.upvotes || 0), 0),
    totalDiscussions: questions.reduce((sum: number, q: any) => sum + (q.comment_count || 0), 0),
  }

  // Calculate badge level
  const badgeLevel = getBadgeLevel(profile.reputation)

  return {
    profile,
    stats,
    badgeLevel,
    questions,
    badges,
  }
}
 