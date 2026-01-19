/**
 * Auth Module - Sistema de autenticación centralizado
 * 
 * Sistema profesional de manejo de autenticación con:
 * - Cache en memoria del perfil de usuario
 * - Sincronización en tiempo real con Supabase Auth
 * - Hooks especializados para diferentes casos de uso
 * - Type safety completo con TypeScript
 * - Reducción de llamadas innecesarias a la API
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

// Tipos
export type { AuthState, AuthContextType } from "./types/auth.types"

// Server actions
export {
  loginUser,
  registerUser,
  logoutUser,
  updateProfileFullName,
} from "./services/auth.api"

export { getSession } from "./services/getSession"

// Validaciones
export { loginSchema, registerSchema } from "./utils/auth.validation"

// Componentes
export { AuthForm } from "./components/AuthForm"
