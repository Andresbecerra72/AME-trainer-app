"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
