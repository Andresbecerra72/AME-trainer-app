# Pull Request

## 📋 Descripción
<!-- Describe qué cambia este PR y por qué -->


## 🏷️ Tipo de cambio
Marca con "x" el tipo de cambio:
- [ ] ✨ Feature (nueva funcionalidad)
- [ ] 🐛 Fix (corrección de bug)
- [ ] 🚑 Hotfix (corrección urgente en producción)
- [ ] ♻️ Refactor (sin cambios funcionales)
- [ ] 📚 Docs (documentación)
- [ ] 🎨 Style (formato, sin cambios de lógica)
- [ ] ⚡ Performance (mejoras de rendimiento)
- [ ] ✅ Test (agregar o actualizar tests)

## ✅ Checklist Arquitectura AME

### 🏗️ Estructura y patrones
- [ ] Sigue arquitectura de features (`features/*`)
- [ ] Server Actions usan `"use server"` y `createSupabaseServerClient()`
- [ ] Validaciones con Zod en `*.validation.ts`
- [ ] UI no contiene lógica de negocio
- [ ] Tipos definidos en `types.ts` del feature correspondiente

### 🔐 Seguridad y permisos
- [ ] RLS policies respetadas
- [ ] Roles verificados con guards apropiados (`requireAdmin`, `requireSuperAdmin`)
- [ ] No se exponen credenciales o datos sensibles
- [ ] Autenticación correctamente implementada

### 🎨 UI y UX
- [ ] No se modificó UI de v0.dev sin aprobación explícita
- [ ] Componentes son responsive (mobile-first)
- [ ] Loading states implementados
- [ ] Error handling visible al usuario

### 🧪 Calidad de código
- [ ] `pnpm lint` pasa sin errores
- [ ] `pnpm build` exitoso
- [ ] Sin warnings críticos de TypeScript
- [ ] Código limpio y legible (nombres descriptivos)

## 🗄️ Base de Datos

### Migraciones SQL
- [ ] No requiere migraciones
- [ ] Nueva migración agregada en `scripts/0XX_*.sql`
- [ ] Migración incluye rollback (si aplica)
- [ ] RLS policies actualizadas (si aplica)

### Tablas afectadas
<!-- Lista las tablas que este PR modifica o crea -->
- 

## 🔧 Variables de Entorno
- [ ] No requiere nuevas variables
- [ ] Nuevas variables documentadas en `.env.example`
- [ ] Variables agregadas en Vercel/Deploy config

**Nuevas variables (si aplica):**
```
VARIABLE_NAME=valor_ejemplo
```

## 🛣️ Rutas y Middleware
- [ ] No afecta rutas
- [ ] Actualizado `middleware.ts` para nuevas rutas protegidas
- [ ] Rutas agregadas están en la carpeta correcta (`/protected`, `/admin`, `/public`)

**Rutas afectadas:**
- 

## 🧪 Testing

### Probado en:
- [ ] Ambiente local (`pnpm dev`)
- [ ] Build de producción (`pnpm build && pnpm start`)
- [ ] Diferentes roles (user/admin/super_admin)
- [ ] Diferentes navegadores
- [ ] Mobile (responsive)

### Escenarios de prueba
<!-- Describe cómo probaste este cambio -->
1. 
2. 
3. 

## 📸 Screenshots
<!-- Si aplica, agrega capturas de pantalla -->


## 📝 Notas adicionales
<!-- Cualquier información relevante para los revisores -->


## 🔗 Enlaces relacionados
<!-- Issues, PRs relacionados, documentación, etc. -->
- Closes #
- Related to #

---

**Checklist para el revisor:**
- [ ] Código revisado línea por línea
- [ ] Tests ejecutados localmente
- [ ] Arquitectura respetada
- [ ] Sin regresiones aparentes
- [ ] Documentación actualizada (si aplica)
