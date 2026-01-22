"use server"

import { cache } from "react"
import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Obtiene la sesión del usuario con cache automático por request
 * 
 * Usa React.cache() para evitar llamadas duplicadas dentro del mismo
 * render tree del servidor. Si llamas getSession() múltiples veces
 * en el mismo request, solo ejecuta la consulta una vez.
 * 
 * IMPORTANTE: Úsalo SOLO en Server Components o Server Actions
 * Para Client Components, usa useAuth() hook
 * 
 * @example Server Component
 * const { user, profile, role } = await getSession()
 */
export const getSession = cache(async () => {
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
})

