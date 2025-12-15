import { supabaseBrowserClient } from "@/lib/supabase/client";

export async function getUserComments(user_id: string) {
  return await supabaseBrowserClient
    .from("comments")
    .select("id", { count: "exact" })
    .eq("author_id", user_id)
}
