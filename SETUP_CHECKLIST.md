# ✅ Checklist de Configuración - Edge Function parse-import-job

## 📦 Archivos creados/modificados

### ✅ Configuración de Supabase
- [x] `supabase/functions/.env.local` - Variables de entorno para Edge Functions
- [x] `supabase/functions/parse-import-job/deno.json` - Configuración de Deno actualizada
- [x] `supabase/functions/parse-import-job/index.ts` - Edge Function corregida
- [x] `supabase/config.toml` - Ya estaba configurado correctamente
- [x] `.vscode/settings.json` - Configuración de Deno para VS Code actualizada

### ✅ Base de datos
- [x] `scripts/010_question_imports.sql` - SQL para crear tabla y bucket

### ✅ Frontend
- [x] `features/questions/import/server/questionImport.actions.ts` - Actualizado para llamar Edge Function

### ✅ Documentación
- [x] `EDGE_FUNCTION_SETUP.md` - Guía completa de configuración
- [x] `START_SCRIPTS.md` - Scripts de inicio
- [x] `TESTING_GUIDE.md` - Guía de pruebas
- [x] `README.md` - Actualizado con información de Edge Functions

### ✅ Scripts de automatización
- [x] `start-dev.ps1` - Script PowerShell para iniciar todo
- [x] `stop-dev.ps1` - Script PowerShell para detener servicios

## 🚀 Pasos de configuración (ejecutar en orden)

### 1️⃣ Instalar prerrequisitos

```powershell
# Verificar instalaciones
node --version        # Debe ser 18+
pnpm --version        # Debe estar instalado
docker --version      # Docker Desktop debe estar corriendo

# Si falta Supabase CLI
choco install supabase
# O
scoop install supabase
```

### 2️⃣ Instalar extensión de VS Code

```
✅ Extensión de Deno instalada: denoland.vscode-deno
```

### 3️⃣ Recargar VS Code

```
Ctrl+Shift+P → "Developer: Reload Window"
```

Después de recargar, los errores de TypeScript en `supabase/functions/parse-import-job/index.ts` deberían desaparecer.

### 4️⃣ Instalar dependencias del proyecto

```powershell
cd c:\Users\JACKA\Desktop\AME_app\ame-app-v1
pnpm install
```

### 5️⃣ Iniciar Supabase local

```powershell
npx supabase start
```

**Espera a ver:**
```
Started supabase local development setup.
         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

### 6️⃣ Aplicar migraciones

```powershell
# Opción A: Reset completo (recomendado primera vez)
npx supabase db reset

# Opción B: Aplicar script específico
# Ir a http://127.0.0.1:54323 → SQL Editor
# Copiar y ejecutar: scripts/010_question_imports.sql
```

### 7️⃣ Crear bucket de Storage

En Supabase Studio (http://127.0.0.1:54323):

1. **Storage** → **Create a new bucket**
2. Name: `question-imports`
3. Public: **NO** ❌
4. Click **Create bucket**

Luego ejecutar en SQL Editor:
```sql
-- RLS policies (copiar de scripts/010_question_imports.sql)
create policy "Users can upload to own folder"
on storage.objects for insert
with check (
  bucket_id = 'question-imports' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view own files"
on storage.objects for select
using (
  bucket_id = 'question-imports' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own files"
on storage.objects for delete
using (
  bucket_id = 'question-imports' 
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

### 8️⃣ Verificar variables de entorno

**Frontend (.env.local en la raíz)**
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Edge Functions (supabase/functions/.env.local)**
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 9️⃣ Iniciar Next.js

```powershell
pnpm dev
```

### 🔟 Verificar que todo funciona

```powershell
# Verificar estado de Supabase
npx supabase status

# Debe mostrar:
# ✔ API URL: http://127.0.0.1:54321
# ✔ DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# ✔ Studio URL: http://127.0.0.1:54323
# ✔ Edge Functions: parse-import-job
```

Acceder a:
- ✅ http://localhost:3000 (Next.js)
- ✅ http://127.0.0.1:54323 (Supabase Studio)
- ✅ http://127.0.0.1:54324 (Inbucket - emails)

## 🧪 Prueba rápida

### Desde la UI

1. Ir a http://localhost:3000
2. Iniciar sesión
3. Ir a la página de importación (probablemente `/protected/add-question`)
4. Subir un PDF de prueba
5. Ver el progreso en tiempo real

### Desde curl (opcional)

```powershell
# 1. Obtener token (desde consola del navegador):
# const session = await (await fetch('/api/auth/session')).json();
# console.log(session.access_token);

# 2. Probar Edge Function
curl -X POST http://127.0.0.1:54321/functions/v1/parse-import-job `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"jobId": "JOB_ID"}'
```

## ⚠️ Troubleshooting

### Errores en VS Code persisten
```powershell
# Recargar ventana
Ctrl+Shift+P → "Developer: Reload Window"

# Verificar que Deno esté habilitado
Ctrl+Shift+P → "Deno: Enable"
```

### Docker no inicia
```powershell
# Iniciar Docker Desktop manualmente
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Puerto 54321 ocupado
```powershell
npx supabase stop
npx supabase start
```

### Edge Function no se ejecuta
```powershell
# Ver logs
npx supabase functions serve parse-import-job --debug
```

### La tabla question_imports no existe
```powershell
# Aplicar migración
npx supabase db reset
```

## 📚 Documentación adicional

- 📘 [EDGE_FUNCTION_SETUP.md](./EDGE_FUNCTION_SETUP.md) - Guía detallada
- 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Cómo probar
- 🚀 [START_SCRIPTS.md](./START_SCRIPTS.md) - Scripts automatizados

## ✅ Todo listo cuando...

- [ ] Supabase local corriendo sin errores
- [ ] Next.js corriendo en http://localhost:3000
- [ ] Studio accesible en http://127.0.0.1:54323
- [ ] Tabla `question_imports` visible en Studio
- [ ] Bucket `question-imports` creado en Storage
- [ ] No hay errores de TypeScript en VS Code
- [ ] Puedes iniciar sesión en la app
- [ ] Puedes subir un archivo PDF desde la UI

## 🎉 ¡Configuración completa!

Para iniciar en el futuro, simplemente ejecuta:

```powershell
.\start-dev.ps1
```

O manualmente:
```powershell
# Terminal 1
npx supabase start

# Terminal 2
pnpm dev
```
