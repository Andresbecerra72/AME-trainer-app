import { supabaseBrowserClient } from "@/lib/supabase/client";

export async function getAllTopicsClient() {
  const { data, error } = await supabaseBrowserClient
    .from("topics")
    .select("*")
    .order("name", { ascending: true });

 if (error) {
    console.error("[v0] Error fetching topics:", error)
    return []
  }
  return data;
}

