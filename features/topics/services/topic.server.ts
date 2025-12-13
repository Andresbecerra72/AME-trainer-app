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

export async function createTopicAction(data: {
  name: string;
  description?: string;
  code?: string;
  icon?: string;
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

  const { data: topic, error } = await supabase
    .from("topics")
    .insert({
      name: data.name,
      description: data.description || null,
      code: data.code || null,
      icon: data.icon || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating topic:", error);
    throw new Error(error.message);
  }

  return topic;
}

export async function updateTopicAction(
  topicId: string,
  data: {
    name: string;
    description?: string;
    code?: string;
    icon?: string;
  }
) {
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

  const { data: topic, error } = await supabase
    .from("topics")
    .update({
      name: data.name,
      description: data.description || null,
      code: data.code || null,
      icon: data.icon || null,
    })
    .eq("id", topicId)
    .select()
    .single();

  if (error) {
    console.error("Error updating topic:", error);
    throw new Error(error.message);
  }

  return topic;
}
