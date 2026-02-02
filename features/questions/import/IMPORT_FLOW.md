# Question Import Flow - Arquitectura Mejorada

## Resumen de Cambios

Se ha refactorizado el flujo de importación para manejar archivos grandes (20+ páginas) sin timeouts HTTP 504/546.

## Problemas Corregidos

### 1. **Loop Infinito Sin Límite**
- **Antes**: `while (!done)` sin límite de intentos → timeout HTTP 504
- **Ahora**: Máximo 100 intentos y 50 segundos de procesamiento síncrono

### 2. **Proceso Bloqueante**
- **Antes**: El servidor esperaba todo el procesamiento completo
- **Ahora**: Fire-and-forget después de 50s, continúa en background

### 3. **Job Trabado en "processing"**
- **Antes**: Si había error, el job quedaba en estado intermedio
- **Ahora**: Manejo robusto de errores con actualización de estado garantizada

### 4. **Sin Recuperación de Errores de OpenAI**
- **Antes**: Un error de OpenAI detenía todo el proceso
- **Ahora**: Errores recuperables (429, 5xx) se saltan, continúa con otras páginas

## Arquitectura del Flujo

```
Cliente
   │
   ├─► uploadTextExtract() [Server Action]
   │      ├─ Crea job en DB (status: pending)
   │      ├─ Guarda raw_text y raw_pages
   │      └─ Lanza processImportJob() en background
   │
   └─► pollImportJobStatus() [Server Action]
          ├─ Consulta estado actual del job
          ├─ Retorna progreso (páginas procesadas)
          └─ Indica si está done (ready/failed)

Background Worker (processImportJob)
   │
   ├─► parse-import-job [Edge Function]
   │      └─ Encola job (status: queued)
   │
   └─► process-import-job-batch [Edge Function] (loop)
          ├─ Toma lock del job
          ├─ Procesa BATCH_PAGES (3-5 páginas)
          ├─ Llama a OpenAI para cada página
          ├─ Actualiza result[] y progreso
          ├─ Libera lock
          └─ Repite hasta completar o fallar
```

## Parámetros de Configuración

### Server Action (`processImportJob`)
```typescript
MAX_ATTEMPTS = 100        // Máximo intentos de polling
MAX_DURATION_MS = 50_000  // 50s antes de retornar "processing"
POLL_INTERVAL_MS = 500    // Intervalo entre consultas
```

### Edge Function Batch (`process-import-job-batch`)
```typescript
BATCH_PAGES = 3           // Páginas por batch (3-5 recomendado)
MAX_WALL_MS = 85_000      // 85s tiempo máximo Edge Function
CONCURRENCY = 2           // Llamadas OpenAI concurrentes
```

## Estados del Job

| Estado | Descripción |
|--------|-------------|
| `pending` | Job creado, esperando procesamiento |
| `queued` | Encolado para procesamiento |
| `processing` | Procesando páginas con OpenAI |
| `ready` | Completado exitosamente |
| `failed` | Error irrecuperable |

## Manejo de Errores

### Errores Recuperables (no fallan el job)
- **429 Rate Limit**: Se salta la página, continúa
- **5xx OpenAI**: Error de servidor, continúa con otras páginas
- **Timeout de OpenAI**: Después de 25s, salta página
- **Texto insuficiente**: Página con <50 caracteres se omite

### Errores que Fallan el Job
- Error de autenticación
- Error de base de datos
- Error de parsing de JSON de OpenAI (no 5xx)
- Página no encontrada en DB

### Timeouts HTTP
- **504/503/546**: No marcan job como failed
- Retornan `{ status: "processing", background: true }`
- Cliente debe hacer polling para ver resultado final

## Uso desde el Cliente

### 1. Subir archivo
```typescript
const job = await uploadTextExtract({
  file: pdfFile,
  userId: user.id,
  rawText: extractedText,
  rawPages: pageArray,  // Opcional: para procesamiento página por página
  extractionMethod: 'pdf'
})
```

### 2. Polling del estado
```typescript
const pollStatus = async (jobId: string) => {
  const status = await pollImportJobStatus(jobId)
  
  if (status.done) {
    if (status.status === 'ready') {
      // ✅ Completado
      console.log(`Extraídas ${status.questionsExtracted} preguntas`)
    } else {
      // ❌ Falló
      console.error(status.error)
    }
    return
  }
  
  // 🔄 Aún procesando
  console.log(`Progreso: ${status.progress.percentage}%`)
  setTimeout(() => pollStatus(jobId), 2000) // Reintentar en 2s
}

pollStatus(job.id)
```

## Logs y Debugging

### Server Action
```
Job enqueued: { jobId, status: "queued" }
Batch result (attempt 1): { done: false, processedPages: [1,2,3] }
Reached time limit for job abc123, continuing in background
```

### Edge Function
```
Extracted 5 questions from page 3
OpenAI request timeout for page 15
Recoverable OpenAI error (429), continuing with other pages
Updating job abc123: { status: "processing", progress: "10/20" }
```

## Mejores Prácticas

1. **Extracción de texto en cliente**: Usar PDF.js o Tesseract.js antes de subir
2. **Páginas individuales**: Enviar `raw_pages[]` para mejor granularidad
3. **Polling progresivo**: Aumentar intervalo si el job toma mucho tiempo
4. **Indicador de progreso**: Mostrar `status.progress.percentage` al usuario
5. **Timeout del cliente**: No esperar más de 60s en la llamada inicial

## Testing

### Archivos Pequeños (<5 páginas)
- Debe completarse en la primera llamada a `processImportJob`
- ~5-15 segundos total

### Archivos Medianos (5-20 páginas)
- Puede requerir 2-5 intentos de batch
- ~20-50 segundos total
- No debería hacer timeout HTTP

### Archivos Grandes (>20 páginas)
- Hará timeout HTTP después de 50s
- Cliente debe usar polling
- ~1-3 minutos total en background

## Monitoreo

### Métricas Clave
- Tiempo promedio por página
- Tasa de errores de OpenAI
- Jobs que terminan en background vs sincrónicos
- Tokens consumidos por job

### Alertas
- Jobs en "processing" por >5 minutos
- Más del 30% de páginas con errores recuperables
- Rate limit (429) frecuente de OpenAI
