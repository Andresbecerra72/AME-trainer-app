import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAllTopicsServer() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("TOPICS SSR ERROR:", error);
    return [];
  }

  return data ?? [];
}
