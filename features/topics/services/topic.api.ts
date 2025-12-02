import { supabaseBrowserClient } from "@/lib/supabase/client";

export async function getAllTopicsClient() {
  const { data, error } = await supabaseBrowserClient
    .from("topics")
    .select("*")
    .order("title", { ascending: true });

  if (error) throw error;
  return data;
}
