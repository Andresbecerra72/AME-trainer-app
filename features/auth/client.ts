/**
 * Auth Module - Client-Side Exports
 * 
 * Importa desde aquí en Client Components
 * 
 * @example
 * "use client"
 * import { useAuth } from "@/features/auth/client"
 */

// Provider principal
export { AuthProvider, UserProvider, useAuthContext } from "./components/UserProvider"

// Hooks especializados
export {
  useAuth,
  useCurrentUser,
  useProfile,
  useRole,
  useIsAuthenticated,
  useRequireAuth,
  useRequireRole,
  useRefreshProfile,
  useUser, // Deprecated
} from "./hooks/useAuth"

export { useRole as useRoleHook, useHasRole } from "./hooks/useRole"

// Componentes de Cliente
export { AuthForm } from "./components/AuthForm"
export { LogoutButton } from "./components/logout-button"

// Tipos (compartidos)
export type { AuthState, AuthContextType } from "./types/auth.types"
