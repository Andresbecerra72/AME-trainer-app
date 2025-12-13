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

export async function getRecentQuestions() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("questions")
        .select(`
          *,
          author:profiles!questions_author_id_fkey (*),
          topic:topics(id, name, code)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3)

  if (error) console.error(error);

  return data ?? [];
}

export async function getQuestionById(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("questions")
    .select(`
      *,
      author:profiles!questions_author_id_fkey(id, full_name, avatar_url),
      topic:topics!questions_topic_id_fkey(id, name, code)
    `)
    .eq("id", id)
    .single()

  return data
}

export async function getTopicQuestions(
  topicId: string,
  options?: {
    searchQuery?: string;
    filter?: string;
  }
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("questions")
    .select(`*,
       topic:topics!questions_topic_id_fkey(*), 
       author:profiles!questions_author_id_fkey(*)`)
    .eq("topic_id", topicId)
    .eq("status", "approved");

  if (options?.searchQuery) {
    query = query.ilike("question_text", `%${options.searchQuery}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching topic questions:", error);
    return [];
  }

  return data ?? [];
}