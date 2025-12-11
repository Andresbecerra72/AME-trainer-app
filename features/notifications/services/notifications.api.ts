import { supabaseBrowserClient } from "@/lib/supabase/client";

export async function markAllNotificationsAsRead(user_id: string) {
  return await supabaseBrowserClient
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user_id)
    .eq("is_read", false)
}