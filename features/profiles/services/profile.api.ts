"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

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