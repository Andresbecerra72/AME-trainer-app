# 🔄 Guía de Entornos Múltiples

## 📋 Descripción

Ahora puedes trabajar con dos entornos separados:

### 🏠 **LOCAL** (Supabase local con Docker)
- Base de datos local en PostgreSQL
- Datos de prueba aislados
- Edge Functions locales
- Perfecto para desarrollo sin afectar producción

### ☁️ **CLOUD** (Supabase Cloud)
- Base de datos remota en Supabase Cloud
- Datos compartidos con producción/staging
- Edge Functions desplegadas
- Para pruebas en entorno real

---

## 🚀 Comandos rápidos

### Opción 1: Scripts de PowerShell (RECOMENDADO)

#### Desarrollo LOCAL
```powershell
# Cambia a entorno local E inicia servicios
.\dev-local.ps1

# Solo cambiar .env sin iniciar
.\dev-local.ps1 -NoStart
```

**Inicia automáticamente:**
- ✅ Docker Desktop (si no está corriendo)
- ✅ Supabase local (`npx supabase start`)
- ✅ Next.js (`pnpm dev`)

**URLs:**
- App: http://localhost:3000
- Studio: http://127.0.0.1:54323
- Inbucket: http://127.0.0.1:54324

---

#### Desarrollo CLOUD
```powershell
# Cambia a entorno cloud E inicia Next.js
.\dev-cloud.ps1

# Solo cambiar .env sin iniciar
.\dev-cloud.ps1 -NoStart
```

**Hace:**
- ✅ Detiene Supabase local
- ✅ Cambia .env a credenciales de Cloud
- ✅ Inicia Next.js conectado a Cloud

**URLs:**
- App: http://localhost:3000
- Studio: https://supabase.com/dashboard/project/naznqbddcvnyosmaznax

⚠️ **CUIDADO:** Conectado a base de datos REMOTA

---

### Opción 2: Comandos npm/pnpm

#### Desarrollo LOCAL
```powershell
# Cambiar entorno + iniciar dev
pnpm dev:local

# Solo cambiar entorno
pnpm env:local
```

#### Desarrollo CLOUD
```powershell
# Cambiar entorno + iniciar dev
pnpm dev:cloud

# Solo cambiar entorno
pnpm env:cloud
```

#### Comandos de Supabase
```powershell
# Iniciar Supabase local
pnpm supabase:start

# Detener Supabase local
pnpm supabase:stop

# Resetear BD local
pnpm supabase:reset

# Ver estado
pnpm supabase:status
```

---

## 📁 Archivos de entorno

### `.env.local` (archivo activo)
El que Next.js usa actualmente. **No lo edites directamente**, déjalo que los scripts lo gestionen.

### `.env.local.development` (template LOCAL)
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (token local)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (token local)
```

### `.env.local.cloud` (template CLOUD)
```env
NEXT_PUBLIC_SUPABASE_URL=https://naznqbddcvnyosmaznax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (tu token real)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (tu token real)
```

### `.env.local.backup` (backup automático)
Creado automáticamente cada vez que cambias de entorno.

---

## 🔄 Flujo de trabajo típico

### Día a día (desarrollo local)
```powershell
# Iniciar entorno local
.\dev-local.ps1

# Trabajar en tu código...
# Hacer cambios en BD local
# Probar features

# Al terminar
pnpm supabase:stop
```

### Probar en Cloud antes de deploy
```powershell
# Cambiar a cloud
.\dev-cloud.ps1

# Probar features en datos reales
# Verificar que todo funcione

# Volver a local
.\dev-local.ps1
```

### Migrar cambios de local a cloud
```powershell
# 1. Crear migración desde local
npx supabase db diff -f nombre_migracion

# 2. Cambiar a cloud
.\dev-cloud.ps1 -NoStart

# 3. Aplicar migración
npx supabase db push

# 4. Volver a local
.\dev-local.ps1
```

---

## ✅ Checklist de verificación

### ¿En qué entorno estoy?

Mira tu `.env.local`:

```powershell
# Ver URL actual
cat .env.local | Select-String "NEXT_PUBLIC_SUPABASE_URL"
```

**Si ves `127.0.0.1`** → Estás en LOCAL ✅
**Si ves `supabase.co`** → Estás en CLOUD ☁️

### ¿Studio correcto?

**LOCAL:** http://127.0.0.1:54323
**CLOUD:** https://supabase.com/dashboard

---

## 🆘 Troubleshooting

### Los cambios no se aplican después de cambiar entorno
```powershell
# Reinicia el servidor de Next.js
# En la terminal de Next.js: Ctrl+C
pnpm dev
```

### Error "Supabase not started"
```powershell
# Asegúrate de estar en entorno local
.\dev-local.ps1
```

### Quiero resetear todo
```powershell
# Detener todo
pnpm supabase:stop

# Resetear BD local
pnpm supabase:reset

# Iniciar de nuevo
.\dev-local.ps1
```

### Ver el estado actual de Supabase
```powershell
pnpm supabase:status
```

---

## 🎯 Tips

### 1. Usa LOCAL por defecto
Trabaja siempre en local a menos que necesites probar con datos reales.

### 2. Backups automáticos
Cada vez que cambias de entorno, se crea `.env.local.backup`. Si algo falla:
```powershell
Copy-Item .env.local.backup .env.local -Force
```

### 3. GitIgnore
Asegúrate de que `.env.local*` esté en `.gitignore`:
```
.env.local
.env.local.*
```

### 4. Edge Functions
**LOCAL:** Se ejecutan automáticamente con `npx supabase start`
**CLOUD:** Debes desplegarlas manualmente:
```powershell
npx supabase functions deploy parse-import-job
```

---

## 📊 Comparación

| Característica | LOCAL | CLOUD |
|----------------|-------|-------|
| Base de datos | PostgreSQL local | Supabase Cloud |
| Datos | Prueba/desarrollo | Compartidos |
| Velocidad | Rápido | Depende de internet |
| Edge Functions | Local | Desplegadas |
| Storage | Local | Cloud |
| Studio URL | 127.0.0.1:54323 | supabase.com/dashboard |
| Riesgo | ✅ Bajo | ⚠️ Alto (datos reales) |
| Ideal para | Desarrollo diario | Pruebas pre-deploy |

---

## 🎉 Resumen

**Para desarrollo normal:**
```powershell
.\dev-local.ps1
```

**Para pruebas en cloud:**
```powershell
.\dev-cloud.ps1
```

**Para volver a local:**
```powershell
.\dev-local.ps1
```

¡Así de simple! 🚀
