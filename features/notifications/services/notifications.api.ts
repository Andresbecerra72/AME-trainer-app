"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NotificationType } from "@/lib/types";

export interface CreateNotificationInput {
  user_id: string
  title: string
  message: string
  link?: string | null
  type?: NotificationType
}

export async function createNotification(input: CreateNotificationInput) {
  const supabase = await createSupabaseServerClient();

  try {
    const payload = {
      user_id: input.user_id,
      type: input.type ?? "mention",
      title: input.title,
      message: input.message,
      link: input.link ?? null,
      is_read: false,
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert(payload)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/protected/notifications")
    return data
  } catch (error) {
    throw new Error(`Failed to create notification: ${String(error)}`)
  }
}

export async function markAllNotificationsAsRead(user_id: string) {
  const supabase = await createSupabaseServerClient(); 
  const result = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user_id)
    .eq("is_read", false)
  
  revalidatePath("/protected/notifications")
  return result
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
  
  revalidatePath("/protected/notifications")
  return result
}
