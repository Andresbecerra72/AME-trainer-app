# Resumen de Correcciones - Import Flow

## 🎯 Problema Principal
Archivos de más de 20 páginas causaban error **HTTP 504/546** y dejaban el job en estado `processing` sin retornar preguntas.

## ✅ Soluciones Implementadas

### 1. **processImportJob** (Server Action)
**Archivo**: `features/questions/import/server/questionImport.actions.ts`

#### Cambios:
- ✅ Añadido **límite de 100 intentos** (antes: loop infinito)
- ✅ Añadido **timeout de 50 segundos** (antes: espera indefinida)
- ✅ Manejo de **timeouts HTTP 504/503/546** sin marcar como failed
- ✅ Retorna `{ status: "processing", background: true }` si excede límites
- ✅ Mejor logging de cada intento de batch
- ✅ Manejo de errores de red con reintentos automáticos

#### Comportamiento Nuevo:
```typescript
// Antes: ❌ Loop infinito
while (!done) { ... }

// Ahora: ✅ Con límites de seguridad
while (!done && attempts < 100 && elapsed < 50_000) { ... }
```

---

### 2. **process-import-job-batch** (Edge Function)
**Archivo**: `supabase/functions/process-import-job-batch/index.ts`

#### Cambios:
- ✅ Validación de texto vacío (salta páginas <50 caracteres)
- ✅ Manejo de errores **recuperables de OpenAI** (429, 5xx)
- ✅ No falla el job completo si una página falla
- ✅ Mejor logging por página procesada
- ✅ Try-catch en parsing de JSON
- ✅ Actualización garantizada del estado incluso en error
- ✅ Limpia campo `error` al procesar exitosamente

#### Errores Recuperables:
```typescript
// Antes: ❌ Cualquier error de OpenAI fallaba todo
if (!res.ok) throw new Error(...)

// Ahora: ✅ Continúa con otras páginas
if (res.status === 429 || res.status >= 500) {
  return { items: [], tokensUsed: 0 } // Salta esta página
}
```

---

### 3. **pollImportJobStatus** (Nueva Función)
**Archivo**: `features/questions/import/server/questionImport.actions.ts`

#### Propósito:
Función dedicada para que el cliente consulte el estado del job sin bloquear.

#### Retorna:
```typescript
{
  status: string              // pending, queued, processing, ready, failed
  progress: {
    current: number           // Páginas completadas
    total: number             // Total de páginas
    percentage: number        // 0-100
  }
  questionsExtracted: number  // Cantidad de preguntas
  error?: string              // Mensaje de error si falló
  done: boolean               // true si ready o failed
}
```

---

### 4. **uploadTextExtract** (Mejorado)
**Archivo**: `features/questions/import/server/questionImport.actions.ts`

#### Cambios:
- ✅ Fire-and-forget de `processImportJob`
- ✅ No espera respuesta para evitar timeout
- ✅ Solo loguea errores graves (no 504/503/546)
- ✅ Retorna job inmediatamente para que cliente haga polling

---

## 📊 Flujo Completo

### Antes (❌ Bloqueante)
```
Cliente → uploadTextExtract()
           ↓ (espera 2+ minutos)
           processImportJob()
             ↓ (loop infinito)
             while (!done) { ... }
           ↓
         ⏱️ TIMEOUT 504
```

### Ahora (✅ Asíncrono)
```
Cliente → uploadTextExtract()
           ↓ (retorna inmediato)
           Job ID
         
Cliente → pollImportJobStatus() (cada 2s)
           ↓
           { progress: 45%, questions: 12 }
           ↓
           { progress: 90%, questions: 27 }
           ↓
           { done: true, status: "ready" }

Background:
  processImportJob()
    ↓ (50s máximo síncrono)
    parse-import-job (encola)
    ↓
    process-import-job-batch (loop)
    ↓ (3 páginas por batch)
    OpenAI × 3 (concurrente)
    ↓
    Actualiza DB con progreso
```

---

## 🧪 Testing Local

### Prerequisitos

1. **Supabase CLI instalado**:
   ```bash
   npm install -g supabase
   ```

2. **Variables de entorno configuradas**:
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=sk-xxx
   ```

### Paso 1: Iniciar Supabase Local

```bash
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1

# Iniciar todos los servicios de Supabase
npx supabase start

# Debería ver:
# Started supabase local development setup.
# API URL: http://127.0.0.1:54321
# Studio URL: http://127.0.0.1:54323
```

### Paso 2: Ejecutar Edge Functions en Modo Debug

**Terminal 1 - Parse Import Job**:
```bash
cd supabase
npx supabase functions serve parse-import-job --debug

# Output esperado:
# Serving functions on http://127.0.0.1:54321/functions/v1/
# Watching: parse-import-job
```

**Terminal 2 - Process Import Job Batch**:
```bash
cd supabase
npx supabase functions serve process-import-job-batch --debug

# Output esperado:
# Serving functions on http://127.0.0.1:54321/functions/v1/
# Watching: process-import-job-batch
```

**IMPORTANTE**: NO uses `--env-file`. Supabase inyecta automáticamente:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Variables de `supabase/functions/.env.local` (como `OPENAI_API_KEY`)

**Terminal 3 - Next.js Dev Server**:
```bash
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1
pnpm dev

# Output esperado:
# Ready on http://localhost:3000
```

### Paso 3: Monitorear Logs en Tiempo Real

**IMPORTANTE**: El CLI de Supabase no soporta streaming de logs localmente. Para ver logs:

**Opción 1: Logs en consola directa (recomendado para local)**
```bash
# Los logs aparecen directamente en la terminal donde ejecutaste "serve"
# Terminal 1: Parse Import Job muestra sus logs
# Terminal 2: Process Import Job Batch muestra sus logs
```

**Opción 2: Docker logs (para desarrollo local)**
```bash
# Ver contenedor de Edge Runtime
docker ps | findstr supabase

# Ver logs del contenedor (reemplazar CONTAINER_ID)
docker logs -f CONTAINER_ID
```

**Opción 3: Supabase Studio (UI local)**
```bash
# Abrir en navegador:
# http://127.0.0.1:54323
# Ir a: Edge Functions > Logs
```

**Opción 4: Logs en producción (Supabase Cloud)**
```bash
# Autenticarse
npx supabase login

# Link al proyecto
npx supabase link --project-ref YOUR_PROJECT_REF

# Ver logs de todas las funciones (últimas invocaciones)
npx supabase functions list

# Para logs detallados, usar el Dashboard web:
# https://app.supabase.com/project/YOUR_PROJECT/logs/edge-functions
```

### Paso 4: Ejecutar Pruebas

**Test 1: Archivo Pequeño (5 páginas)**
**Expectativa**: Completa en ~10 segundos, sin timeout

```bash
# En la aplicación web, sube un PDF de 5 páginas

# Deberías ver en logs (Terminal 1 o 2):
Job created: abc123
Job enqueued: { jobId: 'abc123', status: 'queued', mode: 'page_by_page', total_pages: 5 }
Extracted 3 questions from page 1
Extracted 2 questions from page 2
Batch result (attempt 1): { processedPages: [1,2,3], addedQuestions: 7 }
Batch result (attempt 2): { processedPages: [4,5], done: true, totalQuestionsSoFar: 15 }
```

**Test 2: Archivo Mediano (15 páginas)**
```bash
# Sube un PDF de 15 páginas

# Logs esperados:
Batch result (attempt 1): { processedPages: [1,2,3], addedQuestions: 8 }
Batch result (attempt 2): { processedPages: [4,5,6], addedQuestions: 6 }
Batch result (attempt 3): { processedPages: [7,8,9], addedQuestions: 7 }
Batch result (attempt 4): { processedPages: [10,11,12], addedQuestions: 9 }
Batch result (attempt 5): { processedPages: [13,14,15], done: true, totalQuestionsSoFar: 47 }

# En Next.js dev logs:
Job abc123 processing completed: { status: 'ready' }
```

**Test 3: Archivo Grande (25+ páginas)**
```bash
# Sube un PDF de 25 páginas

# Logs del servidor (después de 50s):
Reached time limit for job abc123, continuing in background

# El cliente recibe:
{ status: "processing", background: true, message: "Job is processing in background" }

# Los logs de Edge Function continúan:
Batch result (attempt 10): { processedPages: [28,29,30], totalQuestionsSoFar: 89 }
...
Batch result (attempt 15): { done: true, status: "ready", totalQuestionsSoFar: 134 }

# El cliente con polling verá:
pollImportJobStatus: { progress: { percentage: 60 }, questionsExtracted: 79 }
pollImportJobStatus: { progress: { percentage: 85 }, questionsExtracted: 112 }
pollImportJobStatus: { done: true, status: "ready", questionsExtracted: 134 }
```

**Test 4: Simular Error de OpenAI**
```bash
# Usar API key inválida temporalmente para ver manejo de errores

# Logs esperados:
OpenAI API error for page 7: Incorrect API key provided
Recoverable OpenAI error (401), continuing with other pages
Skipping page 7 - insufficient text (35 chars)
Extracted 4 questions from page 8  # Continúa normalmente

# El job NO debe fallar, solo salta páginas con error
```

### Paso 5: Inspeccionar Base de Datos

**Ver estado del job en tiempo real**:
```bash
# Abrir Supabase Studio
# http://127.0.0.1:54323

# O ejecutar SQL directamente:
npx supabase db sql
```

```sql
-- Ver todos los imports
SELECT 
  id,
  status,
  file_name,
  next_page,
  total_pages,
  completed_pages,
  jsonb_array_length(result) as questions_count,
  total_tokens_used,
  locked_at,
  created_at,
  updated_at
FROM question_imports
ORDER BY created_at DESC
LIMIT 10;

-- Ver progreso detallado de un job específico
SELECT 
  id,
  status,
  CONCAT(completed_pages, '/', total_pages) as progress,
  jsonb_array_length(result) as questions_extracted,
  total_tokens_used,
  error,
  stats,
  locked_at IS NOT NULL as is_locked
FROM question_imports
WHERE id = 'JOB_ID_HERE';

-- Ver las preguntas extraídas
SELECT 
  jsonb_array_elements(result)->>'question_text' as question,
  jsonb_array_elements(result)->>'correct_answer' as answer
FROM question_imports
WHERE id = 'JOB_ID_HERE'
LIMIT 5;
```

### Paso 6: Testing con cURL

**Probar Edge Functions directamente**:

```bash
# 1. Crear un job manualmente en DB
# 2. Obtener access token del usuario

# Parse import job
curl -X POST http://127.0.0.1:54321/functions/v1/parse-import-job \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"JOB_ID_HERE"}'

# Process batch
curl -X POST http://127.0.0.1:54321/functions/v1/process-import-job-batch \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"JOB_ID_HERE"}'
```

---

## 📊 Monitoreo en Producción

### Ver Logs en Supabase Cloud Dashboard

**Método recomendado**:
1. Ir a: `https://app.supabase.com/project/YOUR_PROJECT/logs/edge-functions`
2. Seleccionar función: `process-import-job-batch` o `parse-import-job`
3. Filtrar por:
   - Rango de tiempo (última hora, último día)
   - Nivel de log (info, error)
   - Búsqueda de texto

**CLI para listar funciones desplegadas**:
```bash
# Autenticarse
npx supabase login

# Link al proyecto
npx supabase link --project-ref YOUR_PROJECT_REF

# Ver funciones desplegadas
npx supabase functions list

# Output:
# ┌────────────────────────────────┬─────────┬──────────┐
# │ NAME                           │ STATUS  │ VERSION  │
# ├────────────────────────────────┼─────────┼──────────┤
# │ parse-import-job               │ ACTIVE  │ v1       │
# │ process-import-job-batch       │ ACTIVE  │ v1       │
# └────────────────────────────────┴─────────┴──────────┘
```

### Dashboard de Supabase

1. Ir a: `https://app.supabase.com/project/YOUR_PROJECT/logs`
2. Seleccionar: **Edge Functions**
3. Filtrar por función: `process-import-job-batch`
4. Ver métricas:
   - Invocaciones por minuto
   - Tasa de error
   - Duración promedio
   - Tokens consumidos

### Alertas Recomendadas

```sql
-- Crear vista para jobs problemáticos
CREATE OR REPLACE VIEW problem_imports AS
SELECT 
  id,
  status,
  file_name,
  error,
  created_at,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at)) / 60 as minutes_stuck
FROM question_imports
WHERE 
  (status = 'processing' AND updated_at < NOW() - INTERVAL '10 minutes')
  OR (status = 'failed' AND updated_at > NOW() - INTERVAL '1 hour');

-- Consultar problemas
SELECT * FROM problem_imports;
```

### Métricas de Performance

```sql
-- Tiempo promedio por página
SELECT 
  AVG(total_tokens_used::float / NULLIF(total_pages, 0)) as avg_tokens_per_page,
  AVG(completed_pages::float / NULLIF(total_pages, 0) * 100) as avg_completion_rate,
  COUNT(*) FILTER (WHERE status = 'ready') as successful_jobs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs
FROM question_imports
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Top 10 archivos más grandes procesados
SELECT 
  file_name,
  total_pages,
  jsonb_array_length(result) as questions_count,
  total_tokens_used,
  EXTRACT(EPOCH FROM (updated_at - created_at)) as processing_seconds
FROM question_imports
WHERE status = 'ready'
ORDER BY total_pages DESC
LIMIT 10;
```

---

## 🐛 Debugging Común

### Problema: Edge Function no inicia localmente

```bash
# Error: "Could not find Deno"
# Solución: Instalar Deno
winget install DenoLand.Deno

# Error: "Port 54321 already in use"
# Solución: Detener Supabase y reiniciar
npx supabase stop
npx supabase start

# Error: "unknown flag: --follow"
# Solución: Los logs se ven directamente en la terminal donde ejecutaste "serve"
# O usar docker logs o Supabase Studio (http://127.0.0.1:54323)
```

### Problema: Job se queda en "processing"

```bash
# 1. Ver logs directamente en la terminal donde ejecutaste "serve"
# O usar Docker logs:
docker ps | findstr supabase
docker logs -f CONTAINER_ID

# 2. Verificar lock en DB
SELECT id, status, locked_at, locked_by FROM question_imports WHERE id = 'JOB_ID';

# 3. Liberar lock manualmente si está trabado >5 minutos
UPDATE question_imports 
SET locked_at = NULL, locked_by = NULL, updated_at = NOW()
WHERE id = 'JOB_ID' AND locked_at < NOW() - INTERVAL '5 minutes';

# 4. Re-procesar manualmente
curl -X POST http://127.0.0.1:54321/functions/v1/process-import-job-batch \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"JOB_ID"}'
```

### Problema: OpenAI Rate Limit

```bash
# Ver cuántos tokens se están usando
SELECT 
  SUM(total_tokens_used) as total_tokens,
  COUNT(*) as jobs_count
FROM question_imports
WHERE created_at > NOW() - INTERVAL '1 hour';

# Solución: Reducir BATCH_PAGES en edge function
# Editar: supabase/functions/process-import-job-batch/index.ts
# Cambiar: const BATCH_PAGES = 3 → const BATCH_PAGES = 2
```

### Problema: No extrae preguntas

```bash
# 1. Verificar raw_text existe
SELECT 
  id, 
  LENGTH(raw_text) as text_length,
  jsonb_array_length(raw_pages) as page_count
FROM question_imports 
WHERE id = 'JOB_ID';

# 2. Ver una muestra del texto
SELECT 
  SUBSTRING(raw_text, 1, 500) as text_sample
FROM question_imports 
WHERE id = 'JOB_ID';

# 3. Ver respuesta de OpenAI en logs
# Logs aparecen en la terminal donde ejecutaste "serve"
# O buscar en Studio: http://127.0.0.1:54323
```

### Problema: JWT Expired / ERR_JWT_EXPIRED

```bash
# Error en logs:
# ERR_JWT_EXPIRED
# claim: "exp"
# reason: "check_failed"
```

**Causa**: El token de acceso del usuario expiró durante el procesamiento (típicamente después de 1 hora).

**Soluciones**:

1. **Refresh del token en el cliente**:
   ```typescript
   // En uploadTextExtract() o antes de llamar Edge Functions
   const { data: { session }, error } = await supabase.auth.getSession()
   
   if (!session) {
     // Intentar refresh
     const { data: refreshed } = await supabase.auth.refreshSession()
     if (!refreshed.session) {
       throw new Error("Session expired. Please login again.")
     }
   }
   ```

2. **Usar Service Role Key en Edge Function** (si el job toma >1 hora):
   ```typescript
   // En process-import-job-batch/index.ts
   // Ya está implementado: usa SUPABASE_SERVICE_ROLE_KEY para operaciones DB
   const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
   ```

3. **Aumentar expiración del JWT** (opcional):
   ```sql
   -- En Supabase Dashboard > Authentication > Settings
   -- JWT Expiry: 3600 (1 hora) → 7200 (2 horas)
   ```

4. **Verificar en local**:
   ```bash
   # Ver detalles del token
   npx supabase db sql
   
   # Ejecutar:
   SELECT 
     id, 
     email,
     last_sign_in_at,
     EXTRACT(EPOCH FROM (NOW() - last_sign_in_at)) / 3600 as hours_since_login
   FROM auth.users
   WHERE id = 'USER_ID';
   ```

**Prevención**: El sistema ya está diseñado para manejar esto:
- ✅ Edge Functions usan Service Role Key para DB
- ✅ Solo la autenticación inicial requiere token de usuario
- ✅ Jobs en background continúan sin depender del token del cliente

**Si el error persiste**:
```bash
# Re-autenticar usuario en la app
# O ejecutar manualmente con un token fresco:
curl -X POST http://127.0.0.1:54321/functions/v1/process-import-job-batch \
  -H "Authorization: Bearer $(npx supabase db sql --execute 'SELECT raw_session FROM auth.sessions ORDER BY created_at DESC LIMIT 1' | grep 'access_token')" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"JOB_ID"}'
```

---

## 🔍 Debugging

### Si el job se queda en "processing"

**Opción 1: Revisar logs de Edge Function**
   ```bash
   # Local: Los logs aparecen en la terminal donde ejecutaste "serve"
   # Ver Terminal 1 (parse-import-job) o Terminal 2 (process-import-job-batch)
   
   # Producción: Dashboard web
   # https://app.supabase.com/project/YOUR_PROJECT/logs/edge-functions
   ```

**Opción 2: Verificar que el lock se libera**:
   ```sql
   SELECT id, status, locked_at, locked_by 
   FROM question_imports 
   WHERE id = 'JOB_ID';
   ```
   
   Si `locked_at` no es NULL por >2 minutos:
   ```sql
   UPDATE question_imports 
   SET locked_at = NULL, locked_by = NULL 
   WHERE id = 'JOB_ID';
   ```

**Opción 3: Ver progreso en DB**:
   ```sql
   SELECT 
     id, 
     status, 
     next_page, 
     total_pages, 
     completed_pages,
     jsonb_array_length(result) as questions_count
   FROM question_imports 
   WHERE id = 'JOB_ID';
   ```

---

## 📝 Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=sk-xxx
```

---

## 🚀 Deploy

1. **Deploy Edge Functions**:
   ```bash
   npx supabase functions deploy parse-import-job
   npx supabase functions deploy process-import-job-batch
   ```

2. **Set Secrets**:
   ```bash
   npx supabase secrets set OPENAI_API_KEY=sk-xxx
   ```

3. **Verificar**:
   ```bash
   npx supabase functions list
   ```

---

## 📚 Documentación Adicional

- [IMPORT_FLOW.md](./IMPORT_FLOW.md) - Arquitectura detallada
- [useQuestionImport.example.tsx](./hooks/useQuestionImport.example.tsx) - Ejemplo de uso en cliente

---

## ✨ Mejoras Futuras

1. **Rate limiting por usuario**: Evitar abuso
2. **Cache de preguntas duplicadas**: Detectar antes de insertar
3. **Streaming de progreso**: WebSockets en vez de polling
4. **Procesamiento paralelo de jobs**: Worker pool
5. **Métricas de rendimiento**: Tiempo promedio por página
