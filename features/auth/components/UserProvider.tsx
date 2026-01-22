"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { supabaseBrowserClient } from "@/lib/supabase/client"
import type { AuthContextType, AuthState } from "../types/auth.types"
import { initialAuthState } from "../types/auth.types"
import type { Profile } from "@/lib/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider de autenticación con cache, optimización y manejo de estado profesional
 * 
 * Features:
 * - Cache en memoria del perfil del usuario
 * - Suscripción en tiempo real a cambios de autenticación
 * - Reducción de llamadas innecesarias a la DB
 * - Estados de carga y error manejados
 * - TypeScript strict para type safety
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState)
  
  // Cache del perfil para evitar llamadas repetidas
  const profileCache = useMemo(() => new Map<string, Profile>(), [])

  /**
   * Obtiene el perfil del usuario desde cache o DB
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      // Check cache primero
      const cached = profileCache.get(userId)
      if (cached) {
        return cached
      }

      try {
        const { data, error } = await supabaseBrowserClient
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          return null
        }

        // Guardar en cache
        if (data) {
          profileCache.set(userId, data)
        }

        return data
      } catch (err) {
        console.error("Unexpected error fetching profile:", err)
        return null
      }
    },
    [profileCache]
  )

  /**
   * Actualiza el estado con usuario y perfil
   */
  const updateAuthState = useCallback(
    async (user: any | null) => {
      if (!user) {
        setState({
          user: null,
          profile: null,
          role: "user",
          isLoading: false,
          isAuthenticated: false,
          error: null,
        })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true }))

      const profile = await fetchProfile(user.id)

      setState({
        user,
        profile,
        role: profile?.role ?? "user",
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
    },
    [fetchProfile]
  )

  /**
   * Refresca el perfil del usuario (útil después de actualizaciones)
   */
  const refreshProfile = useCallback(async () => {
    if (!state.user) return

    // Limpiar cache para forzar refresh
    profileCache.delete(state.user.id)

    const profile = await fetchProfile(state.user.id)

    setState((prev) => ({
      ...prev,
      profile,
      role: profile?.role ?? "user",
    }))
  }, [state.user, fetchProfile, profileCache])

  /**
   * Limpia errores
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    const supabase = supabaseBrowserClient

    // Cargar sesión inicial
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error loading session:", error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }))
        return
      }

      updateAuthState(data.session?.user ?? null)
    })

    // Suscripción a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      // Limpiar cache en logout
      if (event === "SIGNED_OUT") {
        profileCache.clear()
      }

      await updateAuthState(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [updateAuthState, profileCache])

  const value = useMemo(
    () => ({
      ...state,
      refreshProfile,
      clearError,
    }),
    [state, refreshProfile, clearError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para acceder al contexto de autenticación
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  
  return context
}

// Mantener exportación legacy para compatibilidad
export { AuthProvider as UserProvider }

