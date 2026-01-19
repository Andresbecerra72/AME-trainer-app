import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Profile, UserRole } from "@/lib/types"

/**
 * Estado de autenticación de la aplicación
 */
export interface AuthState {
  user: SupabaseUser | null
  profile: Profile | null
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

/**
 * Contexto de autenticación
 */
export interface AuthContextType extends AuthState {
  refreshProfile: () => Promise<void>
  clearError: () => void
}

/**
 * Estado inicial de autenticación
 */
export const initialAuthState: AuthState = {
  user: null,
  profile: null,
  role: "user",
  isLoading: true,
  isAuthenticated: false,
  error: null,
}
