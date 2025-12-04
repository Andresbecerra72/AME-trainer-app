"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

// -----------------------------
// LOGIN
// -----------------------------
export async function loginUser(email: string, password: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

// -----------------------------
// REGISTER  (actualizado con full_name)
// -----------------------------
export async function registerUser(
  email: string,
  password: string,
  full_name: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name, // metadata for initial profile
      },
    },
  })

  return { data, error }
}

// -----------------------------
// UPDATE PROFILE FULL NAME
// -----------------------------
export async function updateProfileFullName(userId: string, full_name: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name })
    .eq("id", userId)

  return { data, error }
}

// -----------------------------
// LOGOUT
// -----------------------------
export async function logoutUser() {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signOut()
  return { error }
}
