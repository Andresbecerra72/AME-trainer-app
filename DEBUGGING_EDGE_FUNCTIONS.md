# Guia de Debugging - Edge Functions no estan procesando

## Problema Detectado
El job se queda en "processing" porque las Edge Functions NO estan corriendo con `serve`.

## Solucion: Ejecutar Edge Functions Localmente

### Paso 1: Asegurar que Supabase esta corriendo
```powershell
npx supabase status
# Debe mostrar "supabase local development setup is running"
```

### Paso 2: Ejecutar Edge Functions en 2 terminales separadas

**Terminal 1 - Parse Import Job**
```powershell
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1\supabase
npx supabase functions serve parse-import-job --debug
```

**Terminal 2 - Process Import Job Batch**
```powershell
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1\supabase
npx supabase functions serve process-import-job-batch --debug
```

**NOTA**: NO uses `--env-file`. Las variables de Supabase se inyectan automáticamente y OPENAI_API_KEY se carga desde `supabase/functions/.env.local`

**Terminal 3 - Next.js (si no esta corriendo)**
```powershell
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1
pnpm dev
```

### Paso 3: Verificar que estan corriendo

Los logs deben mostrar:
```
Serving functions on http://127.0.0.1:54321/functions/v1/
Watching: parse-import-job (o process-import-job-batch)
```

### Paso 4: Probar el flujo completo

1. Sube un archivo PDF en la aplicacion
2. Observa los logs en Terminal 1 y Terminal 2
3. Deberias ver:
   - Terminal 1: "Job enqueued: { jobId: '...', status: 'queued' }"
   - Terminal 2: "Extracted X questions from page Y"

## Verificar Jobs en Base de Datos

### Opcion 1: Supabase Studio (mas facil)
1. Abre: http://127.0.0.1:54323/project/default/editor
2. Ejecuta:

```sql
SELECT 
  id::text,
  status, 
  file_name,
  next_page, 
  total_pages, 
  completed_pages,
  COALESCE(jsonb_array_length(result), 0) as questions_count,
  locked_at IS NOT NULL as is_locked,
  LENGTH(COALESCE(raw_text, '')) as text_length,
  error,
  updated_at
FROM question_imports 
ORDER BY created_at DESC 
LIMIT 5;
```

### Opcion 2: Ver detalles de un job especifico
```sql
SELECT 
  id::text,
  status,
  next_page,
  total_pages,
  completed_pages,
  error,
  updated_at,
  updated_at - created_at as processing_duration
FROM question_imports
WHERE id = 'TU_JOB_ID_AQUI'::uuid;
```

## Si el job esta trabado (locked)

```sql
-- Ver locks
SELECT id::text, status, locked_at, locked_by 
FROM question_imports 
WHERE locked_at IS NOT NULL;

-- Liberar locks manualmente (si estan trabados >5 minutos)
UPDATE question_imports 
SET locked_at = NULL, locked_by = NULL, updated_at = NOW()
WHERE locked_at < NOW() - INTERVAL '5 minutes';
```

## Re-procesar un job manualmente

Si un job se quedo en "processing" y las Edge Functions no estaban corriendo:

### Opcion 1: Actualizar estado y dejar que processImportJob lo retome
```sql
UPDATE question_imports 
SET status = 'queued', locked_at = NULL, locked_by = NULL 
WHERE id = 'TU_JOB_ID_AQUI'::uuid;
```

Luego, desde la aplicacion, llamar `processImportJob(jobId)` nuevamente.

### Opcion 2: Llamar Edge Function directamente

1. Obtener access token del usuario (desde DevTools > Application > Local Storage)
2. Ejecutar:

```powershell
$token = "tu-access-token-aqui"
$jobId = "tu-job-id-aqui"

# Encolar
curl -X POST http://127.0.0.1:54321/functions/v1/parse-import-job `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "{`"jobId`":`"$jobId`"}"

# Procesar batch (repetir hasta done=true)
curl -X POST http://127.0.0.1:54321/functions/v1/process-import-job-batch `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "{`"jobId`":`"$jobId`"}"
```

## Checklist de Debugging

- [ ] Supabase local esta corriendo (`npx supabase status`)
- [ ] Edge Functions estan sirviendo (2 terminales con `serve`)
- [ ] Next.js dev server esta corriendo (`pnpm dev`)
- [ ] Archivo .env.local tiene OPENAI_API_KEY
- [ ] No hay locks trabados en DB
- [ ] Logs muestran actividad cuando subes archivo

## Logs Esperados (Flujo Normal)

### Cuando subes un archivo:

**Next.js console:**
```
Creating import job with X characters (method: pdf)
Page-by-page mode enabled: Y pages
Job abc123 created with text and pages, triggering parser...
```

**Terminal 1 (parse-import-job):**
```
Job enqueued: { 
  jobId: 'abc123', 
  status: 'queued', 
  mode: 'page_by_page', 
  total_pages: 20 
}
```

**Terminal 2 (process-import-job-batch):**
```
Extracted 3 questions from page 1
Extracted 2 questions from page 2
Batch result (attempt 1): { 
  processedPages: [1,2,3], 
  addedQuestions: 7, 
  totalQuestionsSoFar: 7 
}
Updating job abc123: { 
  status: 'processing', 
  progress: '3/20' 
}
```

## Si aun no funciona

1. Detener todo:
```powershell
# Cerrar terminales de Edge Functions (Ctrl+C)
npx supabase stop
```

2. Reiniciar:
```powershell
npx supabase start
# Esperar a que termine
# Luego ejecutar las 3 terminales nuevamente
```

3. Verificar secrets:
```powershell
cd supabase
npx supabase secrets list
# Debe mostrar OPENAI_API_KEY
```
