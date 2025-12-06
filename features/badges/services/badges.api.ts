"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/db-actions"
import { badgeSchema, BadgeInput } from "../utils/badges.validation"
import { revalidatePath } from "next/cache"

export async function createBadge(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const payload: BadgeInput = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    icon: String(formData.get("icon") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
  }

  const parse = badgeSchema.safeParse(payload)
  if (!parse.success) {
    const first = parse.error.errors[0]
    throw new Error(`Invalid input: ${first?.message ?? "Bad request"}`)
  }

  const currentUser = await getCurrentUser()
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "super_admin")) {
    throw new Error("Unauthorized: only admins can create badges")
  }

  // Duplicate detection
  const { data: existing } = await supabase.from("badges").select("id, name")
  if (existing && existing.some((b: any) => String(b.name).toLowerCase() === payload.name.toLowerCase())) {
    throw new Error("A badge with that name already exists")
  }

  const { error } = await supabase.from("badges").insert({
    name: payload.name,
    description: payload.description,
    icon: payload.icon,
    color: payload.color,
    requirement: 1
  })

  if (error) throw new Error(String(error.message ?? error))

  revalidatePath("/admin/badges")
}

export async function assignBadge(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const userId = String(formData.get("userId") ?? "").trim()
  const badgeId = String(formData.get("badgeId") ?? "").trim()

  if (!userId || !badgeId) throw new Error("userId and badgeId are required")

  const currentUser = await getCurrentUser()
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "super_admin")) {
    throw new Error("Unauthorized: only admins can assign badges")
  }

  const { error } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badgeId,
  })

  if (error) throw new Error(String(error.message ?? error))

  revalidatePath("/admin/badges")
}

export async function getBadges() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("name")

  console.log("BADGES error:", error, "data:", data) 

  return { data, error }
}