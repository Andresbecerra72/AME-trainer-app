/**
 * Auth Module - Server-Side Exports
 * 
 * Importa desde aquí en Server Components y Server Actions
 * 
 * @example
 * import { getSession } from "@/features/auth/server"
 */

// Server Actions
export {
  loginUser,
  registerUser,
  logoutUser,
  updateProfileFullName,
} from "./services/auth.api"

// Session Management
export { getSession } from "./services/getSession"

// Validaciones (pueden usarse en ambos lados)
export { loginSchema, registerSchema } from "./utils/auth.validation"

// Tipos
export type { AuthState, AuthContextType } from "./types/auth.types"
