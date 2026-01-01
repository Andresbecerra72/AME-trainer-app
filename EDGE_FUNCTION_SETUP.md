# 🚀 Guía: Ejecutar y probar la función parse-import-job localmente

## 📋 Prerequisitos

1. **Supabase CLI instalado**
   ```bash
   # Windows (con Chocolatey)
   choco install supabase

   # O con Scoop
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase

   # O descarga desde: https://github.com/supabase/cli/releases
   ```

2. **Docker Desktop instalado y ejecutándose**
   - Descarga: https://www.docker.com/products/docker-desktop/

3. **Deno instalado** (opcional, solo para desarrollo)
   ```bash
   # Windows (con Chocolatey)
   choco install deno

   # O con PowerShell
   irm https://deno.land/install.ps1 | iex
   ```

## 🛠️ Configuración inicial

### 1. Iniciar servicios de Supabase local

```bash
cd c:\Users\JACKA\Desktop\AME_app\ame-app-v1

# Iniciar todos los servicios (Postgres, PostgREST, GoTrue, Storage, Edge Functions)
npx supabase start
```

**Salida esperada:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Aplicar migraciones de base de datos

```bash
# Aplicar el script de question_imports
npx supabase db reset
```

O ejecuta manualmente el SQL en Studio:
1. Abre http://127.0.0.1:54323
2. Ve a SQL Editor
3. Copia y ejecuta el contenido de `scripts/010_question_imports.sql`

### 3. Crear el bucket de Storage

En Supabase Studio (http://127.0.0.1:54323):
1. Ve a **Storage** → **Create a new bucket**
2. Nombre: `question-imports`
3. **Public bucket**: NO (desmarcado)
4. Click en **Create bucket**

Luego aplica las RLS policies (desde SQL Editor):
```sql
-- RLS policies para el bucket
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

### 4. Verificar variables de entorno

El archivo `supabase/functions/.env.local` ya está configurado con:
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

También asegúrate de tener en tu `.env.local` del proyecto Next.js:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 🎯 Ejecutar la aplicación

### Terminal 1: Supabase (si aún no está corriendo)
```bash
npx supabase start
```

### Terminal 2: Next.js Frontend
```bash
pnpm dev
```

El frontend estará en: http://localhost:3000

## 🧪 Probar la funcionalidad

### Opción 1: Desde la UI (recomendado)

1. **Inicia sesión** en la aplicación (http://localhost:3000)
2. Ve a la página de **Importar Preguntas** (probablemente `/protected/add-question` o similar)
3. Selecciona un archivo PDF con preguntas en el formato esperado
4. Click en **Subir** o **Importar**
5. Observa el progreso:
   - ✅ Archivo subido
   - ⏳ Procesando...
   - ✅ Listo (con N preguntas detectadas)

### Opción 2: Probar directamente la Edge Function con curl

```bash
# 1. Obtén un token de usuario válido
# Inicia sesión en la app y copia el access_token desde DevTools → Application → Storage

# 2. Crea un job de prueba (con un archivo real subido)
# ...

# 3. Invoca la función
curl -X POST http://127.0.0.1:54321/functions/v1/parse-import-job \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "YOUR_JOB_ID"}'
```

### Opción 3: Probar con archivo de prueba

Crea un PDF con este contenido:
```
Q: ¿Cuál es la capital de Francia?
A) Londres
B) Berlín
C) París
D) Madrid
Answer: C

Q: ¿Cuántos planetas hay en el sistema solar?
A) 7
B) 8
C) 9
D) 10
Answer: B
```

## 📊 Monitorear logs

### Logs de Edge Functions
```bash
# En tiempo real
npx supabase functions serve --debug
```

### Logs en la aplicación Next.js
Observa la consola de tu terminal donde ejecutaste `pnpm dev`

### Logs en Supabase Studio
1. Abre http://127.0.0.1:54323
2. Ve a **Table Editor** → `question_imports`
3. Verifica el estado de los trabajos:
   - `pending` → inicial
   - `processing` → en proceso
   - `ready` → completado (verifica columna `result`)
   - `failed` → error (verifica columna `error`)

## 🐛 Debugging

### La función no se ejecuta
```bash
# Reinicia Supabase
npx supabase stop
npx supabase start
```

### Errores de permisos en Storage
- Verifica que las RLS policies estén aplicadas
- Confirma que el usuario esté autenticado
- Revisa que el path sea: `userId/jobId/filename.pdf`

### Errores de PDF parsing
- La función usa `pdfjs-dist` que puede fallar con PDFs complejos
- Para PDFs escaneados (imágenes), necesitarás implementar OCR (Fase 2)
- Verifica el `raw_text` extraído en la columna `raw_text` de `question_imports`

### Hot reload no funciona
```bash
# En supabase/config.toml, verifica:
[edge_runtime]
policy = "per_worker"  # debe ser per_worker, no oneshot
```

## 📁 Estructura de archivos importante

```
supabase/
  functions/
    parse-import-job/
      index.ts           # Edge Function principal
      deno.json          # Configuración de Deno
    .env.local           # Variables de entorno

features/questions/import/
  server/
    questionImport.actions.ts  # Server Actions (Next.js)
  hooks/
    useQuestionImportJob.ts    # Hook de React
  components/
    FileUploadStatusCard.tsx   # UI para subir archivos

scripts/
  010_question_imports.sql     # SQL para crear tabla y bucket
```

## 🚦 Flujo completo

1. **Usuario sube archivo** → `uploadImportFile()`
2. **Archivo a Storage** → bucket `question-imports`
3. **Job creado** → tabla `question_imports` (status: pending)
4. **Frontend llama** → `processImportJob()` (Server Action)
5. **Server Action invoca** → Edge Function `/functions/v1/parse-import-job`
6. **Edge Function:**
   - Descarga PDF de Storage
   - Extrae texto con pdfjs-dist
   - Parsea preguntas con regex
   - Actualiza job (status: ready, result: [...])
7. **Frontend polling** → obtiene resultado actualizado
8. **Usuario revisa** → preguntas detectadas en UI

## 🎉 ¡Listo!

Ahora puedes:
- ✅ Subir PDFs con preguntas
- ✅ Extraer texto automáticamente
- ✅ Detectar preguntas estructuradas
- ✅ Revisar y confirmar antes de guardar

## 🔗 Recursos adicionales

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy Docs](https://deno.com/deploy/docs)
- [pdfjs-dist NPM](https://www.npmjs.com/package/pdfjs-dist)
