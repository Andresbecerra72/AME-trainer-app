import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserNotifications(user_id: string) {
  const supabase = await createSupabaseServerClient(); 
  const { data, error } = await supabase
     .from("notifications")
    .select(`
      *,
      actor:users!notifications_actor_id_fkey(id, full_name, avatar_url),
      question:questions(id, question_text)
    `)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) console.error(error);

  return data ?? [];

}