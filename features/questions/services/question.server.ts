import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getQuestionsByTopicServer(topicId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      users (id, full_name, reputation),
      topics (id, title)
    `)
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false });

  if (error) console.error("SSR QUESTION ERROR:", error);

  return data ?? [];
}

export async function getQuestionFeedServer() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      users (id, full_name),
      topics (id, title)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) console.error(error);

  return data ?? [];
}
