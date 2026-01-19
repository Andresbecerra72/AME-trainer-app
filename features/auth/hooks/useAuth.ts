import { useAuthContext } from "../components/UserProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Hook principal de autenticación
 * 
 * Proporciona acceso completo al estado de autenticación con type safety
 * 
 * @example
 * ```tsx
 * const { user, profile, role, isLoading } = useAuth()
 * ```
 */
export function useAuth() {
  return useAuthContext()
}

/**
 * Hook para acceso rápido al usuario autenticado
 * 
 * @returns El usuario de Supabase o null
 * 
 * @example
 * ```tsx
 * const user = useCurrentUser()
 * if (!user) return <div>Please log in</div>
 * ```
 */
export function useCurrentUser() {
  const { user } = useAuthContext()
  return user
}

/**
 * Hook para acceso rápido al perfil del usuario
 * 
 * @returns El perfil del usuario o null
 * 
 * @example
 * ```tsx
 * const profile = useProfile()
 * return <div>Welcome {profile?.display_name}</div>
 * ```
 */
export function useProfile() {
  const { profile } = useAuthContext()
  return profile
}

/**
 * Hook para verificar el rol del usuario
 * 
 * @returns El rol del usuario (user | admin | super_admin)
 * 
 * @example
 * ```tsx
 * const role = useRole()
 * const isAdmin = role === 'admin' || role === 'super_admin'
 * ```
 */
export function useRole() {
  const { role } = useAuthContext()
  return role
}

/**
 * Hook para verificar si el usuario está autenticado
 * 
 * @returns true si está autenticado, false si no
 * 
 * @example
 * ```tsx
 * const isAuthenticated = useIsAuthenticated()
 * if (!isAuthenticated) return <LoginPrompt />
 * ```
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthContext()
  return isAuthenticated
}

/**
 * Hook que requiere autenticación
 * Redirige al login si el usuario no está autenticado
 * 
 * @param redirectTo - Ruta de redirección (default: /public/auth/login)
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, isLoading } = useRequireAuth()
 *   
 *   if (isLoading) return <Loading />
 *   return <div>Protected content for {user.email}</div>
 * }
 * ```
 */
export function useRequireAuth(redirectTo = "/public/auth/login") {
  const auth = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo])

  return auth
}

/**
 * Hook que requiere un rol específico
 * Redirige si el usuario no tiene el rol necesario
 * 
 * @param requiredRole - Rol requerido
 * @param redirectTo - Ruta de redirección si no tiene el rol
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { isLoading } = useRequireRole('admin')
 *   
 *   if (isLoading) return <Loading />
 *   return <div>Admin Panel</div>
 * }
 * ```
 */
export function useRequireRole(
  requiredRole: "admin" | "super_admin",
  redirectTo = "/protected/dashboard"
) {
  const auth = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (auth.isLoading) return

    const hasPermission =
      requiredRole === "admin"
        ? auth.role === "admin" || auth.role === "super_admin"
        : auth.role === "super_admin"

    if (!hasPermission) {
      router.replace(redirectTo)
    }
  }, [auth.isLoading, auth.role, requiredRole, router, redirectTo])

  return auth
}

/**
 * Hook para refrescar el perfil del usuario
 * Útil después de actualizaciones del perfil
 * 
 * @example
 * ```tsx
 * const refreshProfile = useRefreshProfile()
 * 
 * async function updateProfile(data) {
 *   await updateProfileAction(data)
 *   await refreshProfile() // Refresca el cache
 * }
 * ```
 */
export function useRefreshProfile() {
  const { refreshProfile } = useAuthContext()
  return refreshProfile
}

// Hook legacy para compatibilidad hacia atrás
/**
 * @deprecated Use useAuth() instead
 */
export function useUser() {
  console.warn("useUser() is deprecated. Use useAuth() instead.")
  const { user, profile, role } = useAuthContext()
  return { user, profile, role }
}
