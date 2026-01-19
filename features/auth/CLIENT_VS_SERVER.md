# 🔄 Client vs Server - Sistema de Autenticación

## 📋 Regla de Oro

```
Server Components → import { getSession } from "@/features/auth"
Client Components → import { useAuth } from "@/features/auth/client"
```

---

## 🖥️ Server Components

### ✅ Usar: `getSession()` desde `@/features/auth`

```tsx
// ✅ CORRECTO - Server Component
import { getSession } from "@/features/auth"

export default async function DashboardPage() {
  const { user, profile, role } = await getSession()
  
  if (!user) redirect("/login")
  
  return <div>Welcome {profile?.full_name}</div>
}
```

### ❌ NO usar: `useAuth()` ni ningún hook

```tsx
// ❌ ERROR - No puedes usar hooks en Server Components
import { useAuth } from "@/features/auth/client"

export default async function DashboardPage() {
  const { user } = useAuth() // ❌ Error: useEffect no funciona aquí
  //...
}
```

---

## 💻 Client Components

### ✅ Usar: `useAuth()` desde `@/features/auth/client`

```tsx
// ✅ CORRECTO - Client Component
"use client"

import { useAuth } from "@/features/auth/client"

export function UserProfile() {
  const { user, profile, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>Welcome {profile?.full_name}</div>
}
```

### ❌ NO usar: `getSession()` con await

```tsx
// ❌ ERROR - No puedes usar await en Client Components
"use client"

import { getSession } from "@/features/auth"

export function UserProfile() {
  const { user } = await getSession() // ❌ Error: await no permitido
  //...
}
```

---

## 📦 Puntos de Entrada

### `@/features/auth` - Solo Server
- `getSession()` - Obtener sesión server-side
- `loginUser()` - Server action de login
- `registerUser()` - Server action de registro
- `logoutUser()` - Server action de logout
- Tipos TypeScript

### `@/features/auth/client` - Solo Client
- `useAuth()` - Hook principal
- `useProfile()` - Hook de perfil
- `useRole()` - Hook de rol
- `useRequireAuth()` - Protección de rutas
- `AuthProvider` - Context Provider
- `AuthForm` - Componente de formulario
- Todos los hooks especializados

---

## 🎯 ¿Cómo Identificar qué tipo de componente es?

### Server Component (por defecto)
```tsx
// NO tiene "use client"
// Puede ser async
// Archivo en app/**/*.tsx (por defecto)

export default async function Page() {
  // Usa: await getSession()
}
```

### Client Component
```tsx
// Tiene directiva "use client" al inicio
// NO puede ser async
// Usa hooks de React

"use client"

export function Component() {
  // Usa: useAuth()
}
```

---

## 📊 Tabla de Referencia Rápida

| Ubicación | Tipo | Función Auth | Ejemplo |
|-----------|------|--------------|---------|
| `app/**/page.tsx` (async) | Server | `await getSession()` | Dashboard |
| `app/**/layout.tsx` (async) | Server | `await getSession()` | Layout con auth |
| `app/api/**/route.ts` | Server | `await getSession()` | API Routes |
| `features/**/components/*.tsx` | Client | `useAuth()` | Formularios, UI |
| `components/*.tsx` ("use client") | Client | `useAuth()` | Componentes UI |

---

## 🚀 Ventajas de Cada Enfoque

### `getSession()` en Server Components

**Ventajas:**
- ✅ Se ejecuta en el servidor (más seguro)
- ✅ Puede usar variables de entorno privadas
- ✅ Mejor SEO (HTML pre-renderizado)
- ✅ Menos JavaScript al cliente
- ✅ Cache con React.cache()

**Usar para:**
- Páginas principales (dashboard, profile, etc.)
- Layouts con autenticación
- API Routes
- Middleware

### `useAuth()` en Client Components

**Ventajas:**
- ✅ Estado reactivo en tiempo real
- ✅ Se actualiza automáticamente
- ✅ Sincronización con Supabase Auth
- ✅ Cache en memoria del navegador
- ✅ Perfecto para UI interactiva

**Usar para:**
- Formularios de login/registro
- Menús de usuario
- Botones condicionales
- Widgets interactivos
- Notificaciones en tiempo real

---

## 🔧 Sistema de Cache

### Server-Side (getSession)

```tsx
// Primera llamada: consulta DB
const session1 = await getSession()

// Segunda llamada en el mismo request: usa cache
const session2 = await getSession() // ⚡ Sin consulta DB

// En un nuevo request: consulta DB de nuevo
```

**Cache scope:** Por request del servidor

### Client-Side (useAuth)

```tsx
// Primera vez que se monta el AuthProvider: consulta DB
const { user, profile } = useAuth()

// Siguientes usos: lee del cache en memoria
const { user } = useAuth() // ⚡ Sin consulta DB

// Logout: limpia cache automáticamente
```

**Cache scope:** Durante toda la sesión del navegador

---

## 🐛 Errores Comunes

### Error 1: Usar hook en Server Component

```tsx
// ❌ ERROR
export default async function Page() {
  const { user } = useAuth() // "useEffect only works in Client Component"
}

// ✅ SOLUCIÓN
export default async function Page() {
  const { user } = await getSession()
}
```

### Error 2: Usar await en Client Component

```tsx
// ❌ ERROR
"use client"
export function Component() {
  const { user } = await getSession() // Syntax error
}

// ✅ SOLUCIÓN
"use client"
export function Component() {
  const { user } = useAuth()
}
```

### Error 3: Importar desde lugar incorrecto

```tsx
// ❌ ERROR - importa desde path directo
import { getSession } from "@/features/auth/services/getSession"

// ✅ CORRECTO - importa desde punto de entrada
import { getSession } from "@/features/auth"
```

---

## 📝 Patrón Recomendado

### Página con Server Component + Client Components

```tsx
// app/protected/dashboard/page.tsx (Server Component)
import { getSession } from "@/features/auth"
import { UserWidget } from "./UserWidget"

export default async function DashboardPage() {
  // Obtén datos en el servidor
  const { user, profile } = await getSession()
  
  if (!user) redirect("/login")
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Pasa datos al Client Component como props */}
      <UserWidget initialProfile={profile} />
    </div>
  )
}
```

```tsx
// app/protected/dashboard/UserWidget.tsx (Client Component)
"use client"

import { useAuth } from "@/features/auth"

export function UserWidget({ initialProfile }) {
  // En Client Component, usa hook para actualizaciones en tiempo real
  const { profile, refreshProfile } = useAuth()
  
  return (
    <div>
      <p>Name: {profile?.full_name || initialProfile?.full_name}</p>
      <button onClick={refreshProfile}>Refresh</button>
    </div>
  )
}
```

---

## 🎓 Resumen

1. **Server Components** (async, sin "use client")
   - Usa: `await getSession()`
   - Ventaja: Seguro, SEO, menos JS

2. **Client Components** ("use client")
   - Usa: `useAuth()` y hooks especializados
   - Ventaja: Reactivo, interactivo, tiempo real

3. **Nunca mezcles**
   - ❌ Hook en Server Component
   - ❌ Await en Client Component

4. **Punto de entrada único**
   - ✅ `import { getSession, useAuth } from "@/features/auth"`

---

**Regla mnemotécnica:**
- **Server** = **S**ession → `await getSession()`
- **Client** = **U**seAuth → `useAuth()`
