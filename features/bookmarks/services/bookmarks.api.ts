import { supabaseBrowserClient } from "@/lib/supabase/client";

export async function getUserBookmarks(user_id: string) {
  return await supabaseBrowserClient
   .from("bookmarks")
   .select("id", { count: "exact" })
   .eq("user_id",user_id)
}