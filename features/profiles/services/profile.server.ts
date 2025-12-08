"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getAllUserProfiles(
  selectFields: string = "id, full_name, role", 
  orderBy: string = "full_name", 
  ascending: boolean = true
): Promise<{ data: any[] | null; error: any | null }> {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("profiles")
    .select(selectFields)
    .order(orderBy, { ascending })

  return { data, error }
}
