# ⚡ Quick Start - Sistema de Autenticación

**Tiempo estimado:** 5 minutos

---

## 🎯 Caso de Uso Rápido

### 1️⃣ Obtener información del usuario

```typescript
import { useAuth } from "@/features/auth"

function MyComponent() {
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <div>Welcome {profile?.display_name}!</div>
}
```

### 2️⃣ Proteger una página

```typescript
import { useRequireAuth } from "@/features/auth"

function ProtectedPage() {
  const { user, isLoading } = useRequireAuth()
  // Redirige automáticamente si no está autenticado
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>Secret content for {user?.email}</div>
}
```

### 3️⃣ Verificar roles

```typescript
import { useRole } from "@/features/auth"

function AdminButton() {
  const role = useRole()
  const isAdmin = role === 'admin' || role === 'super_admin'
  
  if (!isAdmin) return null
  
  return <button>Admin Panel</button>
}
```

### 4️⃣ Actualizar perfil

```typescript
import { useRefreshProfile } from "@/features/auth"

function EditProfile() {
  const refreshProfile = useRefreshProfile()
  
  async function handleSave(data: any) {
    await updateProfile(data)
    await refreshProfile() // Refresca el cache
    alert('Profile updated!')
  }
  
  return <button onClick={() => handleSave({})}>Save</button>
}
```

### 5️⃣ Server-side (Server Component o Server Action)

```typescript
import { getSession } from "@/features/auth"

export default async function ServerPage() {
  const { user, profile, role } = await getSession()
  
  if (!user) redirect("/public/auth/login")
  
  return <div>Server-side welcome {profile?.display_name}</div>
}
```

---

## 🛠️ Setup (Ya está hecho)

El sistema ya está configurado en tu proyecto. Solo importa y usa.

```typescript
// app/layout.tsx ya tiene:
import { UserProvider } from "@/features/auth"

<UserProvider>
  {children}
</UserProvider>
```

---

## 📚 Hooks Disponibles

| Hook | Propósito | Retorna |
|------|-----------|---------|
| `useAuth()` | Estado completo | `{ user, profile, role, isLoading, isAuthenticated }` |
| `useCurrentUser()` | Solo usuario | `SupabaseUser \| null` |
| `useProfile()` | Solo perfil | `Profile \| null` |
| `useRole()` | Solo rol | `"user" \| "admin" \| "super_admin"` |
| `useIsAuthenticated()` | ¿Está autenticado? | `boolean` |
| `useRequireAuth()` | Protege página | Redirige si no auth |
| `useRequireRole()` | Requiere rol | Redirige si no tiene rol |
| `useRefreshProfile()` | Refresca cache | `() => Promise<void>` |

---

## 🎨 Ejemplos Comunes

### Navbar con login/logout

```typescript
import { useAuth } from "@/features/auth"

function Navbar() {
  const { isAuthenticated, profile } = useAuth()
  
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Hi, {profile?.display_name}</span>
          <button>Logout</button>
        </>
      ) : (
        <a href="/public/auth/login">Login</a>
      )}
    </nav>
  )
}
```

### Página solo para admins

```typescript
import { useRequireRole } from "@/features/auth"

function AdminPage() {
  const { isLoading } = useRequireRole('admin')
  
  if (isLoading) return <div>Checking permissions...</div>
  
  return <div>Admin Panel</div>
}
```

### Mostrar avatar del usuario

```typescript
import { useProfile } from "@/features/auth"

function UserAvatar() {
  const profile = useProfile()
  
  if (!profile) return null
  
  return (
    <img 
      src={profile.avatar_url || '/default.png'} 
      alt={profile.display_name}
    />
  )
}
```

---

## 🐛 Troubleshooting

### ❓ "useAuth must be used within AuthProvider"

**Solución:** Asegúrate de que tu componente esté dentro del `<UserProvider>` en `app/layout.tsx`.

### ❓ El perfil no se actualiza después de editarlo

**Solución:** Llama a `refreshProfile()` después de actualizar:

```typescript
const refreshProfile = useRefreshProfile()

await updateProfile(data)
await refreshProfile() // ← Agrega esto
```

### ❓ TypeScript muestra errores de tipos

**Solución:** El sistema usa tipos estrictos. Usa optional chaining:

```typescript
// ❌ Puede causar error
<div>{user.email}</div>

// ✅ Correcto
<div>{user?.email}</div>
```

---

## 📖 Documentación Completa

Para más detalles, consulta:

- 📖 [README.md](./README.md) - Guía completa con ejemplos
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- 💡 [usage-examples.tsx](./examples/usage-examples.tsx) - 8 ejemplos prácticos

---

## ✅ Checklist de Implementación

Cuando uses el sistema en un componente nuevo:

- [ ] Importar el hook apropiado
- [ ] Manejar estado de carga (`isLoading`)
- [ ] Manejar caso no autenticado
- [ ] Usar optional chaining (`?.`) para datos del usuario
- [ ] Agregar type annotations si es necesario

---

## 🎉 ¡Listo!

Ya puedes usar el sistema de autenticación profesional en tu app.

**Siguiente paso:** Abre [README.md](./README.md) para ver más ejemplos.

---

**💡 Tip:** Usa hooks especializados en lugar del hook general para mejor performance:

```typescript
// ✅ Mejor
const profile = useProfile()
const role = useRole()

// ⚠️ Funciona pero menos óptimo
const { profile, role } = useAuth()
```
