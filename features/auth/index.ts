/**
 * Auth Module - Sistema de autenticación centralizado
 * 
 * ⚠️ IMPORTANTE: Este archivo exporta SOLO funciones de servidor
 * 
 * Para Server Components y Server Actions:
 *   import { getSession } from "@/features/auth"
 * 
 * Para Client Components:
 *   import { useAuth } from "@/features/auth/client"
 * 
 * Sistema profesional de manejo de autenticación con:
 * - Cache en memoria del perfil de usuario
 * - Sincronización en tiempo real con Supabase Auth
 * - Hooks especializados para diferentes casos de uso
 * - Type safety completo con TypeScript
 * - Reducción de llamadas innecesarias a la API
 */

// ============================================
// SOLO EXPORTACIONES DE SERVIDOR
// ============================================

// Server Actions
export {
  loginUser,
  registerUser,
  logoutUser,
  updateProfileFullName,
} from "./services/auth.api"

// Session Management (Server-side)
export { getSession } from "./services/getSession"

// Validaciones (Server-side)
export { loginSchema, registerSchema } from "./utils/auth.validation"

// Tipos (compartidos)
export type { AuthState, AuthContextType } from "./types/auth.types"
