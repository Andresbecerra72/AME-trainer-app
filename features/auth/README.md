# Sistema de Autenticación - AME Exam Trainer

Sistema profesional de manejo de autenticación y sesión de usuario con cache, sincronización en tiempo real y TypeScript strict.

## 🚀 Características

- ✅ **Cache en memoria** - Reduce llamadas innecesarias a la base de datos
- ✅ **Sincronización en tiempo real** - Detecta cambios de auth automáticamente
- ✅ **Type-safe** - TypeScript strict para evitar errores
- ✅ **Hooks especializados** - APIs limpias para casos de uso específicos
- ✅ **Performance optimizado** - Memoización y callbacks para evitar re-renders
- ✅ **Estados de carga** - Manejo profesional de estados asíncronos
- ✅ **Error handling** - Manejo robusto de errores

## 📦 Instalación

El sistema ya está configurado en el proyecto. Solo necesitas usar el provider en tu layout:

```tsx
// app/layout.tsx
import { AuthProvider } from "@/features/auth"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## 🎯 Uso Básico

### Hook principal: `useAuth()`

Hook completo con acceso a todo el estado de autenticación:

```tsx
import { useAuth } from "@/features/auth"

function Dashboard() {
  const { user, profile, role, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <LoginPrompt />
  
  return (
    <div>
      <h1>Welcome {profile?.display_name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {role}</p>
    </div>
  )
}
```

### Hooks especializados

#### `useCurrentUser()` - Acceso rápido al usuario

```tsx
import { useCurrentUser } from "@/features/auth"

function UserBadge() {
  const user = useCurrentUser()
  
  if (!user) return null
  
  return <div>{user.email}</div>
}
```

#### `useProfile()` - Acceso rápido al perfil

```tsx
import { useProfile } from "@/features/auth"

function ProfileCard() {
  const profile = useProfile()
  
  return (
    <div>
      <img src={profile?.avatar_url} />
      <h3>{profile?.display_name}</h3>
    </div>
  )
}
```

#### `useRole()` - Verificación de roles

```tsx
import { useRole } from "@/features/auth"

function AdminPanel() {
  const role = useRole()
  const isAdmin = role === 'admin' || role === 'super_admin'
  
  if (!isAdmin) return <AccessDenied />
  
  return <AdminContent />
}
```

#### `useIsAuthenticated()` - Estado de autenticación

```tsx
import { useIsAuthenticated } from "@/features/auth"

function Header() {
  const isAuthenticated = useIsAuthenticated()
  
  return (
    <nav>
      {isAuthenticated ? <UserMenu /> : <LoginButton />}
    </nav>
  )
}
```

### Protección de rutas

#### `useRequireAuth()` - Requiere autenticación

```tsx
import { useRequireAuth } from "@/features/auth"

function ProtectedPage() {
  const { user, isLoading } = useRequireAuth()
  
  // Si no está autenticado, redirige automáticamente
  
  if (isLoading) return <Loading />
  
  return <div>Protected content for {user.email}</div>
}
```

#### `useRequireRole()` - Requiere rol específico

```tsx
import { useRequireRole } from "@/features/auth"

function AdminPage() {
  const { isLoading } = useRequireRole('admin')
  
  // Si no tiene el rol, redirige automáticamente
  
  if (isLoading) return <Loading />
  
  return <div>Admin Panel</div>
}
```

### Actualizar perfil

#### `useRefreshProfile()` - Refresca el cache del perfil

```tsx
import { useRefreshProfile } from "@/features/auth"
import { updateProfile } from "@/features/profiles/services/profile.api"

function EditProfileForm() {
  const refreshProfile = useRefreshProfile()
  
  async function handleSubmit(data) {
    await updateProfile(data)
    
    // Refresca el cache para obtener los datos actualizados
    await refreshProfile()
    
    toast.success("Profile updated!")
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

## 🔒 Server-Side Auth

### `getSession()` - Server Action

Para obtener la sesión en Server Components o Server Actions:

```tsx
import { getSession } from "@/features/auth"

// Server Component
export default async function DashboardPage() {
  const { user, profile, role } = await getSession()
  
  if (!user) redirect("/public/auth/login")
  
  return <div>Welcome {profile?.display_name}</div>
}

// Server Action
"use server"
export async function createQuestion(data) {
  const { user, role } = await getSession()
  
  if (!user) throw new Error("Unauthorized")
  
  // ... lógica
}
```

## 🎨 Componentes

### `<AuthForm />` - Formulario de login/registro

```tsx
import { AuthForm } from "@/features/auth"

function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <AuthForm type="login" />
    </div>
  )
}

function RegisterPage() {
  return (
    <div>
      <h1>Create Account</h1>
      <AuthForm type="register" />
    </div>
  )
}
```

## 📊 Estado de Autenticación

El `AuthState` contiene:

```typescript
interface AuthState {
  user: SupabaseUser | null          // Usuario de Supabase
  profile: Profile | null             // Perfil del usuario
  role: UserRole                      // Rol: "user" | "admin" | "super_admin"
  isLoading: boolean                  // Estado de carga
  isAuthenticated: boolean            // Si está autenticado
  error: string | null                // Error si existe
}
```

## ⚡ Optimizaciones

### Cache automático

El sistema mantiene un cache en memoria del perfil del usuario:

- Primera carga: consulta a la DB
- Cargas subsecuentes: usa el cache
- Refresco: usa `refreshProfile()` para invalidar cache

### Reducción de re-renders

Todos los hooks usan `useMemo` y `useCallback` para evitar renders innecesarios.

### Sincronización en tiempo real

El sistema escucha cambios de autenticación de Supabase automáticamente:

- Login → actualiza estado
- Logout → limpia estado y cache
- Cambio de sesión → sincroniza automáticamente

## 🔧 Configuración Avanzada

### Personalizar redirección

```tsx
// Redirigir a una ruta específica después de login
useRequireAuth("/public/auth/login")

// Redirigir a dashboard si no tiene rol admin
useRequireRole('admin', '/protected/dashboard')
```

## 🚨 Manejo de Errores

El sistema captura y maneja errores automáticamente:

```tsx
const { error, clearError } = useAuth()

if (error) {
  return (
    <div>
      <p>Error: {error}</p>
      <button onClick={clearError}>Dismiss</button>
    </div>
  )
}
```

## 📝 Mejores Prácticas

1. **Usa hooks especializados** - En lugar de `useAuth()` siempre, usa `useProfile()`, `useRole()`, etc.
2. **Server-side para datos sensibles** - Usa `getSession()` en Server Components
3. **Refresca después de updates** - Llama `refreshProfile()` después de actualizar el perfil
4. **Type-safe siempre** - Aprovecha TypeScript para evitar errores

## 🔄 Migración desde sistema anterior

Si usabas el antiguo `useUser()`:

```tsx
// ❌ Antiguo
const { user, profile, role } = useUser()

// ✅ Nuevo - Opción 1: Hook principal
const { user, profile, role } = useAuth()

// ✅ Nuevo - Opción 2: Hooks especializados (recomendado)
const user = useCurrentUser()
const profile = useProfile()
const role = useRole()
```

## 📚 API Reference

Ver [auth.types.ts](./types/auth.types.ts) para tipos completos.

Ver [useAuth.ts](./hooks/useAuth.ts) para todos los hooks disponibles.

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Agrega tipos en `types/auth.types.ts`
2. Implementa en `components/UserProvider.tsx`
3. Exporta hooks en `hooks/useAuth.ts`
4. Actualiza documentación

---

**¿Preguntas?** Revisa el código en `features/auth/` o consulta con el equipo.
