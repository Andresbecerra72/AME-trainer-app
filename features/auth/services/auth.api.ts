import { supabaseBrowserClient } from "@/lib/supabase/client";

export function loginUser(email: string, password: string) {
  return supabaseBrowserClient.auth.signInWithPassword({ email, password });
}

export function registerUser(email: string, password: string) {
  return supabaseBrowserClient.auth.signUp({ email, password });
}

export function logoutUser() {
  return supabaseBrowserClient.auth.signOut();
}
