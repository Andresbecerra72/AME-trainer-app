# 🎯 Sistema de entornos múltiples implementado

## ✅ Archivos creados

### Configuración de entornos
- ✅ `.env.local.development` - Credenciales LOCAL (Supabase local)
- ✅ `.env.local.cloud` - Credenciales CLOUD (Supabase Cloud)

### Scripts de PowerShell
- ✅ `dev-local.ps1` - Cambiar a entorno local + iniciar servicios
- ✅ `dev-cloud.ps1` - Cambiar a entorno cloud + iniciar Next.js

### Documentación
- ✅ `ENTORNOS_MULTIPLES.md` - Guía completa de uso

### Configuración
- ✅ `package.json` actualizado con nuevos scripts npm
- ✅ `.gitignore` actualizado para excluir archivos de entorno

---

## 🚀 Cómo usar

### Desarrollo LOCAL (recomendado para día a día)

**Opción 1: Script PowerShell**
```powershell
.\dev-local.ps1
```
Esto automáticamente:
1. Cambia `.env.local` a credenciales locales
2. Inicia Docker (si no está corriendo)
3. Inicia Supabase local
4. Inicia Next.js

**Opción 2: Comando npm**
```powershell
pnpm dev:local
```

---

### Desarrollo CLOUD (para pruebas en BD remota)

**Opción 1: Script PowerShell**
```powershell
.\dev-cloud.ps1
```
Esto automáticamente:
1. Cambia `.env.local` a credenciales de cloud
2. Detiene Supabase local
3. Inicia Next.js conectado a Supabase Cloud

**Opción 2: Comando npm**
```powershell
pnpm dev:cloud
```

⚠️ **IMPORTANTE:** En modo cloud estás conectado a tu base de datos REMOTA. Ten cuidado con los cambios.

---

### Solo cambiar entorno (sin iniciar servicios)

```powershell
# Cambiar a local
.\dev-local.ps1 -NoStart

# Cambiar a cloud
.\dev-cloud.ps1 -NoStart
```

O con npm:
```powershell
pnpm env:local   # Cambiar a local
pnpm env:cloud   # Cambiar a cloud
```

---

## 📋 Comandos disponibles

### NPM Scripts (package.json)

| Comando | Descripción |
|---------|-------------|
| `npm run dev:local` | Cambiar a local + iniciar dev |
| `npm run dev:cloud` | Cambiar a cloud + iniciar dev |
| `npm run env:local` | Solo cambiar a local |
| `npm run env:cloud` | Solo cambiar a cloud |
| `npm run supabase:start` | Iniciar Supabase local |
| `npm run supabase:stop` | Detener Supabase local |
| `npm run supabase:reset` | Resetear BD local |
| `npm run supabase:status` | Ver estado de Supabase |

---

## 🔍 Verificar entorno actual

```powershell
# Ver URL de Supabase configurada
cat .env.local | Select-String "NEXT_PUBLIC_SUPABASE_URL"
```

**Si ves:**
- `http://127.0.0.1:54321` → Estás en **LOCAL** ✅
- `https://...supabase.co` → Estás en **CLOUD** ☁️

---

## 📁 Estructura de archivos

```
proyecto/
├── .env.local                    # Archivo activo (gestionado por scripts)
├── .env.local.development        # Template LOCAL
├── .env.local.cloud              # Template CLOUD
├── .env.local.backup             # Backup automático
├── dev-local.ps1                 # Script para LOCAL
├── dev-cloud.ps1                 # Script para CLOUD
├── ENTORNOS_MULTIPLES.md         # Guía completa
└── package.json                  # Scripts npm actualizados
```

---

## 🎯 Casos de uso

### 1. Desarrollo diario
```powershell
# Iniciar entorno local
.\dev-local.ps1

# Trabajar en tu código...
# Al terminar:
pnpm supabase:stop
```

### 2. Probar en Cloud antes de deploy
```powershell
# Cambiar a cloud
.\dev-cloud.ps1

# Probar features
# Verificar que todo funcione

# Volver a local
.\dev-local.ps1
```

### 3. Migrar cambios de local a cloud
```powershell
# 1. Generar migración desde local
.\dev-local.ps1 -NoStart
npx supabase db diff -f mi_migracion

# 2. Cambiar a cloud
.\dev-cloud.ps1 -NoStart

# 3. Aplicar migración
npx supabase db push

# 4. Volver a local
.\dev-local.ps1
```

---

## ⚠️ Importante

### Backups automáticos
Cada vez que cambias de entorno, el script crea un backup:
- `.env.local.backup` - Contiene el .env.local anterior

Para restaurar:
```powershell
Copy-Item .env.local.backup .env.local -Force
```

### GitIgnore
Los siguientes archivos están excluidos de Git (contienen credenciales):
- `.env.local`
- `.env.local.*`
- `.env.local.backup`

### Reiniciar después de cambiar entorno
Si cambias de entorno con Next.js corriendo:
1. Detén el servidor (Ctrl+C en terminal de Next.js)
2. Inicia de nuevo: `pnpm dev`

---

## 📖 Documentación completa

Lee [ENTORNOS_MULTIPLES.md](./ENTORNOS_MULTIPLES.md) para:
- Comparación detallada LOCAL vs CLOUD
- Troubleshooting
- Tips y mejores prácticas
- Flujos de trabajo avanzados

---

## 🎉 ¡Listo para usar!

**Inicio rápido:**

```powershell
# Desarrollo local (recomendado)
.\dev-local.ps1

# Pruebas en cloud
.\dev-cloud.ps1
```

¡Así de fácil! 🚀
