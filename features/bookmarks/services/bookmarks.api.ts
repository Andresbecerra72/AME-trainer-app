import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserBookmarks(user_id: string) {
   const supabase = await createSupabaseServerClient()
  return await supabase
   .from("bookmarks")
   .select("id", { count: "exact"})
   .eq("user_id",user_id)
}