import { supabaseBrowserClient } from "@/lib/supabase/client";

export async function getUsernotifications(user_id: string) {
  return await supabaseBrowserClient
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("is_read", false)
}