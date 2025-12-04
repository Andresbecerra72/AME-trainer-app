"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getSession() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null, role: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return {
    user,
    profile,
    role: profile?.role ?? "user",
  }
}

