"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAllTopicsServer() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("TOPICS SSR ERROR:", error);
    return [];
  }

  return data ?? [];
}

export async function getTopicById(topicId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("id", topicId)
    .single();

  if (error) {
    console.error("Error fetching topic:", error);
    return null;
  }

  return data;
}
