"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { topicBatchSchema, type TopicBatchInput } from "../utils/topic.validation";
import { revalidatePath } from "next/cache";

export async function getAllTopicsServer() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("code", { ascending: true });

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
      icon: data.icon?.toLowerCase() || null,
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

/**
 * Create multiple topics at once (batch creation)
 * @param input - Batch input with array of topics
 * @returns Array of created topics
 */
export async function createTopicBatchAction(input: TopicBatchInput) {
  const supabase = await createSupabaseServerClient();

  // Authenticate and authorize
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  // Validate input
  const validation = topicBatchSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Validation error: ${validation.error.issues[0].message}`);
  }

  // Check for duplicate codes
  const codes = input.topics.map((t) => t.code);
  const { data: existingTopics } = await supabase
    .from("topics")
    .select("code")
    .in("code", codes);

  if (existingTopics && existingTopics.length > 0) {
    const duplicateCodes = existingTopics.map((t) => t.code).join(", ");
    throw new Error(`Topics with these codes already exist: ${duplicateCodes}`);
  }

  // Prepare data for insertion
  const topicsToInsert = input.topics.map((topic) => ({
    name: topic.name,
    description: topic.description,
    code: topic.code,
    icon: topic.icon?.toLowerCase() || null,
    question_count: 0,
  }));

  // Insert all topics
  const { data: createdTopics, error } = await supabase
    .from("topics")
    .insert(topicsToInsert)
    .select();

  if (error) {
    console.error("Error creating topics batch:", error);
    throw new Error(`Failed to create topics: ${error.message}`);
  }

  // Revalidate admin pages
  revalidatePath("/admin/topics");
  revalidatePath("/protected/dashboard");

  return createdTopics;
}

/**
 * Delete a topic by ID
 */
export async function deleteTopicAction(topicId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  const { error } = await supabase
    .from("topics")
    .delete()
    .eq("id", topicId);

  if (error) {
    console.error("Error deleting topic:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/topics");
  return { success: true };
}
