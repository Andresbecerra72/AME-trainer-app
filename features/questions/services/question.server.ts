"use server";

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

export async function getAllQuestionsForAdmin(options?: {
  searchQuery?: string;
  status?: string;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("questions")
    .select(`
      *
    `);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.searchQuery) {
    query = query.ilike("question_text", `%${options.searchQuery}%`);
  }

  query = query.order("created_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching questions for admin:", error);
    return [];
  }

  return data ?? [];
}

export async function deleteQuestionAction(questionId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    console.error("Error deleting question:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

export async function updateQuestionStatusAction(questionId: string, status: "approved" | "rejected" | "pending") {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  const { error } = await supabase
    .from("questions")
    .update({ status })
    .eq("id", questionId);

  if (error) {
    console.error("Error updating question status:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

export async function updateQuestionAction(questionId: string, data: {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  topic_id: string;
  difficulty: string;
  explanation?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  const { error } = await supabase
    .from("questions")
    .update({
      question_text: data.question_text,
      option_a: data.option_a,
      option_b: data.option_b,
      option_c: data.option_c,
      option_d: data.option_d,
      correct_answer: data.correct_answer,
      topic_id: data.topic_id,
      difficulty: data.difficulty,
      explanation: data.explanation || null,
    })
    .eq("id", questionId);

  if (error) {
    console.error("Error updating question:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

