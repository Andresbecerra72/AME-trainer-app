"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { QuickAction, RoleQuickAction, QuickActionWithVisibility, UpdateRoleQuickActionPayload } from "../types"
import { revalidatePath } from "next/cache"

/**
 * Get all active quick actions
 */
export async function getQuickActions(): Promise<QuickAction[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("quick_actions")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) {
    console.error("Error fetching quick actions:", error)
    return []
  }

  return data || []
}

/**
 * Get quick actions for a specific role (filtered by visibility)
 */
export async function getQuickActionsForRole(role: string): Promise<QuickActionWithVisibility[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("role_quick_actions")
    .select(`
      id,
      is_hidden,
      display_order,
      quick_action:quick_actions (
        id,
        title,
        description,
        icon,
        color,
        bg_color,
        path,
        display_order,
        is_active
      )
    `)
    .eq("role", role)
    .order("display_order")

  if (error) {
    console.error("Error fetching role quick actions:", error)
    return []
  }

  // Transform and filter
  const actions: QuickActionWithVisibility[] = data
    .filter((item: any) => item.quick_action && item.quick_action.is_active)
    .map((item: any) => ({
      ...item.quick_action,
      is_hidden: item.is_hidden,
      role_display_order: item.display_order,
    }))

  // Filter out hidden actions and sort by role display order
  return actions
    .filter(action => !action.is_hidden)
    .sort((a, b) => a.role_display_order - b.role_display_order)
}

/**
 * Get role configuration for all quick actions (Admin use)
 */
export async function getRoleQuickActionsConfig(role: string): Promise<RoleQuickAction[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("role_quick_actions")
    .select(`
      *,
      quick_action:quick_actions (*)
    `)
    .eq("role", role)
    .order("display_order")

  if (error) {
    console.error("Error fetching role config:", error)
    return []
  }

  return data || []
}

/**
 * Update role quick action visibility
 */
export async function updateRoleQuickAction(payload: UpdateRoleQuickActionPayload): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient()

  const { role, quick_action_id, is_hidden, display_order } = payload

  // Check if entry exists
  const { data: existing } = await supabase
    .from("role_quick_actions")
    .select("id")
    .eq("role", role)
    .eq("quick_action_id", quick_action_id)
    .single()

  let result

  if (existing) {
    // Update existing
    const updateData: any = { is_hidden }
    if (display_order !== undefined) {
      updateData.display_order = display_order
    }

    result = await supabase
      .from("role_quick_actions")
      .update(updateData)
      .eq("role", role)
      .eq("quick_action_id", quick_action_id)
  } else {
    // Insert new
    result = await supabase
      .from("role_quick_actions")
      .insert({
        role,
        quick_action_id,
        is_hidden,
        display_order: display_order || 0,
      })
  }

  if (result.error) {
    console.error("Error updating role quick action:", result.error)
    return { success: false, error: result.error.message }
  }

  revalidatePath("/protected/dashboard")
  revalidatePath("/admin/settings")

  return { success: true }
}

/**
 * Bulk update role quick actions (for reordering)
 */
export async function bulkUpdateRoleQuickActions(
  role: string,
  updates: Array<{ quick_action_id: string; is_hidden: boolean; display_order: number }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient()

  // Execute updates in parallel
  const promises = updates.map((update) =>
    updateRoleQuickAction({
      role,
      quick_action_id: update.quick_action_id,
      is_hidden: update.is_hidden,
      display_order: update.display_order,
    })
  )

  const results = await Promise.all(promises)

  const hasError = results.some((r) => !r.success)
  if (hasError) {
    const errorMessages = results.filter((r) => r.error).map((r) => r.error).join(", ")
    return { success: false, error: errorMessages }
  }

  revalidatePath("/protected/dashboard")
  revalidatePath("/admin/settings")

  return { success: true }
}

/**
 * Create a new quick action (Super Admin only)
 */
export async function createQuickAction(action: Omit<QuickAction, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("quick_actions")
    .insert(action)
    .select()
    .single()

  if (error) {
    console.error("Error creating quick action:", error)
    return { success: false, error: error.message }
  }

  // Add to all roles by default (visible)
  const roles = ["user", "admin", "super_admin"]
  const roleInserts = roles.map((role) => ({
    role,
    quick_action_id: data.id,
    is_hidden: false,
    display_order: action.display_order,
  }))

  await supabase.from("role_quick_actions").insert(roleInserts)

  revalidatePath("/protected/dashboard")
  revalidatePath("/admin/settings")

  return { success: true }
}
