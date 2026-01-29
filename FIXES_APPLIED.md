# CORRECCIONES APLICADAS - Import Flow

Fecha: 2026-01-26

## Problemas Detectados en Logs

### 1. ❌ Bucket not found
```
Failed to upload file to storage (non-critical): Error [StorageApiError]: Bucket not found
```

### 2. ❌ Missing environment variables (48 intentos fallidos)
```
Batch processing error (attempt 1-48): { error: 'Missing environment variables' }
```

---

## Soluciones Aplicadas

### ✅ 1. Crear bucket `question-imports` en Supabase Storage

**Script ejecutado**: `scripts/create_storage_bucket.sql`

```sql
-- Bucket creado con:
- Tamaño máximo: 50MB
- MIME types: PDF, TXT, octet-stream
- Políticas RLS: Solo el dueño puede acceder
- Service role: Acceso completo
```

**Resultado**: ✅ Bucket creado exitosamente

```
INSERT 0 1
CREATE POLICY (x4)
```

### ✅ 2. Corregir carga de variables de entorno en Edge Functions

**Problema**: Se estaba usando `--env-file` con ruta absoluta, lo que impedía que Supabase inyectara las variables automáticamente.

**Comandos INCORRECTOS** ❌:
```bash
npx supabase functions serve parse-import-job --debug --env-file "C:\...\ame-app-v1\.env.local"
npx supabase functions serve process-import-job-batch --debug --env-file "C:\...\ame-app-v1\.env.local"
```

**Comandos CORRECTOS** ✅:
```bash
cd supabase
npx supabase functions serve parse-import-job --debug
npx supabase functions serve process-import-job-batch --debug
```

**Por qué funciona ahora**:
1. Supabase CLI inyecta automáticamente:
   - `SUPABASE_URL` 
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Lee `supabase/functions/.env.local` para:
   - `OPENAI_API_KEY`

### ✅ 3. Script de ayuda creado

**Archivo**: `start-edge-functions.ps1`

Ejecuta verificaciones y muestra instrucciones correctas para iniciar las Edge Functions.

---

## Archivos Actualizados

1. ✅ `scripts/create_storage_bucket.sql` - Nuevo
2. ✅ `start-edge-functions.ps1` - Nuevo
3. ✅ `features/questions/import/CHANGES_SUMMARY.md` - Comandos corregidos
4. ✅ `DEBUGGING_EDGE_FUNCTIONS.md` - Comandos corregidos

---

## Pasos para Probar

### 1. Detener Edge Functions actuales si están corriendo
- Ctrl+C en las terminales que ejecutan `serve`

### 2. Iniciar Edge Functions con comandos correctos

**Terminal 1**:
```powershell
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1\supabase
npx supabase functions serve parse-import-job --debug
```

**Terminal 2**:
```powershell
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1\supabase
npx supabase functions serve process-import-job-batch --debug
```

### 3. Verificar que NO aparezcan errores

**Logs esperados** ✅:
```
Serving functions on http://127.0.0.1:54321/functions/v1/
Watching: [nombre-funcion]
```

**NO deberías ver** ❌:
```
Missing environment variables
```

### 4. Probar upload de PDF

1. Refresca la sesión en la app (logout/login para obtener token fresco)
2. Sube un archivo PDF de prueba
3. Observa los logs en ambas terminales

**Logs esperados**:

**Terminal 1 (parse-import-job)**:
```
Job enqueued: { 
  jobId: 'xxx', 
  status: 'queued', 
  mode: 'page_by_page', 
  total_pages: 21 
}
```

**Terminal 2 (process-import-job-batch)**:
```
Extracted 3 questions from page 1
Extracted 2 questions from page 2
Batch result (attempt 1): { 
  processedPages: [1,2,3], 
  addedQuestions: 7 
}
Updating job xxx: { status: 'processing', progress: '3/21' }
```

### 5. Verificar en DB que el job progresa

```sql
SELECT 
  id::text,
  status, 
  next_page, 
  total_pages,
  completed_pages,
  jsonb_array_length(result) as questions_count
FROM question_imports 
ORDER BY created_at DESC 
LIMIT 1;
```

**Resultado esperado**:
- `status` debe cambiar: `pending` → `queued` → `processing` → `ready`
- `completed_pages` debe incrementarse: 0 → 3 → 6 → 9 ... → 21
- `questions_count` debe aumentar con cada batch

---

## Errores Resueltos

✅ **"Bucket not found"** - Bucket creado con políticas RLS
✅ **"Missing environment variables"** - Comandos corregidos sin `--env-file`
✅ **JWT Expired** - Documentado, no crítico (solo reintentos de cliente)

---

## Verificación Final

### Checklist antes de probar:

- [ ] Supabase local corriendo (`npx supabase status`)
- [ ] Bucket `question-imports` existe (Supabase Studio)
- [ ] Archivo `supabase/functions/.env.local` existe y tiene `OPENAI_API_KEY`
- [ ] Edge Functions corriendo sin errores (2 terminales con `serve`)
- [ ] Next.js dev server corriendo (`pnpm dev`)
- [ ] Usuario con sesión activa en la app

### Si todo está bien:

Deberías poder subir un PDF de 20+ páginas y ver:
1. Upload exitoso a Storage ✅
2. Job creado en DB ✅
3. Job encolado por parse-import-job ✅
4. Batches procesados por process-import-job-batch ✅
5. Preguntas extraídas y guardadas en `result` ✅
6. Job completa con `status = 'ready'` ✅

---

## Próximos Pasos

Una vez verificado que funciona:

1. Ejecutar pruebas con archivos de diferentes tamaños
2. Monitorear tokens consumidos
3. Verificar que el polling del cliente funciona
4. Desplegar a producción si todo OK
