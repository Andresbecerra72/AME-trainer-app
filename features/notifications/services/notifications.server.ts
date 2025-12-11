import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserNotifications(user_id: string) {
  const supabase = await createSupabaseServerClient(); 
  const { data, error } = await supabase
     .from("notifications")
    .select(`
      *,
      actor:profiles!notifications_user_id_fkey(id, full_name, avatar_url)
    `)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) console.error(error);

  return data ?? [];

}

export async function getUserUnreadNotifications(user_id: string) {
  const supabase = await createSupabaseServerClient(); 
  return await supabase
    .from("notifications")
    .select(`
      *
    `, { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("is_read", false)
}