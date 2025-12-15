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

  if (error) {
    console.error(error);
    return [];
  }

  if (!data) return [];

  // Validate notification links to ensure resources still exist
  const validatedNotifications = await Promise.all(
    data.map(async (notification) => {
      let isValid = true;

      // Extract question ID from link if it's a question notification
      if (notification.link && notification.link.includes("/questions/")) {
        const questionIdMatch = notification.link.match(/questions\/([a-f0-9-]+)/);
        if (questionIdMatch) {
          const questionId = questionIdMatch[1];
          const { data: question } = await supabase
            .from("questions")
            .select("id")
            .eq("id", questionId)
            .single();
          
          isValid = !!question;
        }
      }

      return {
        ...notification,
        isValid,
      };
    })
  );

  return validatedNotifications;
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
