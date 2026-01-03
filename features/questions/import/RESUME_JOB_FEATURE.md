# Feature: Resume Job Monitoring

## Descripción

Sistema para mostrar y reanudar el monitoreo de jobs de importación que están en proceso (`pending` o `processing`). Esto mejora la UX al permitir que los usuarios:

1. **Vean jobs en proceso** cuando vuelven a la página
2. **Reanuden el monitoreo** sin re-subir archivos
3. **Ahorren tiempo y ancho de banda** al no re-extraer ni re-procesar

## Estructura de Archivos

```
features/questions/import/
├── hooks/
│   ├── usePendingJobs.ts          # Hook para obtener jobs pendientes
│   └── useQuestionImportJob.ts     # Extendido con resumeJob()
├── server/
│   └── getPendingJobs.actions.ts   # Server action para query DB
└── components/
    └── PendingJobsCard.tsx         # UI para mostrar y reanudar jobs
```

## Uso

### 1. Hook: usePendingJobs

```typescript
import { usePendingJobs } from "@/features/questions/import/hooks/usePendingJobs"

function MyComponent() {
  const { pendingJobs, isLoading, refresh } = usePendingJobs()
  
  // pendingJobs: QuestionImportJob[] - Jobs con status 'pending' o 'processing'
  // isLoading: boolean - Estado de carga inicial
  // refresh: () => Promise<void> - Refrescar lista manualmente
}
```

### 2. Hook: useQuestionImportJob (extendido)

```typescript
import { useQuestionImportJob } from "@/features/questions/import/hooks/useQuestionImportJob"

function MyComponent() {
  const { 
    job, 
    resumeJob,    // ← NUEVO
    startUpload 
  } = useQuestionImportJob()
  
  // Reanudar monitoreo de un job existente
  const handleResume = (existingJob: QuestionImportJob) => {
    resumeJob(existingJob)
    // Automáticamente comienza polling si status es 'pending' o 'processing'
  }
}
```

### 3. Componente: PendingJobsCard

```typescript
import { PendingJobsCard } from "@/features/questions/import/components"

<PendingJobsCard 
  jobs={pendingJobs}
  onResumeJob={(job) => resumeJob(job)}
  isLoading={isLoading}
/>
```

## Flujo de Usuario

### Escenario 1: Usuario cierra página durante procesamiento

```
1. Usuario sube PDF de 21 páginas
   ↓
2. Procesamiento toma ~90 segundos
   ↓
3. Usuario cierra la pestaña (navegó a otra página)
   ↓ [Job sigue procesándose en background]
   
4. Usuario vuelve a /protected/add-question
   ↓
5. Ve PendingJobsCard: "Resume Processing - 1 import in progress"
   ↓
6. Click en "Monitor"
   ↓
7. resumeJob() comienza polling automático
   ↓
8. Cuando termina: muestra "120 questions detected" ✅
```

### Escenario 2: Múltiples jobs pendientes

```
Usuario ve:
┌─────────────────────────────────────┐
│ 📋 Resume Processing                │
│ You have 3 imports in progress      │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 📄 exam-questions.pdf        │   │
│ │ 🔵 Processing... 2 mins ago  │   │
│ │ 21 pages • 52k chars    [Monitor] │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 📄 practice-test.pdf         │   │
│ │ ⚠️ Pending 5 mins ago        │   │
│ │ 15 pages • 38k chars    [Monitor] │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 📄 study-guide.pdf           │   │
│ │ 🔵 Processing... 10 mins ago │   │
│ │ 8 pages • 19k chars     [Monitor] │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Lógica de Negocio

### Server Action: getPendingJobs

```typescript
// Obtiene últimos 5 jobs con status 'pending' o 'processing'
const { data } = await supabase
  .from("question_imports")
  .select("*")
  .eq("user_id", user.id)
  .in("status", ["pending", "processing"])
  .order("created_at", { ascending: false })
  .limit(5)
```

**Reglas:**
- ✅ Solo jobs del usuario actual
- ✅ Solo status `pending` o `processing`
- ✅ Máximo 5 jobs (más recientes primero)
- ✅ Ordenados por fecha de creación descendente

### Hook: resumeJob

```typescript
function resumeJob(existingJob: QuestionImportJob) {
  setJob(existingJob)
  
  // Solo inicia polling si aún está en proceso
  if (existingJob.status === "pending" || existingJob.status === "processing") {
    beginPolling(existingJob.id)
  }
}
```

**Reglas:**
- ✅ No re-extrae texto del archivo
- ✅ No re-sube a storage
- ✅ Solo comienza polling del job existente
- ✅ Automáticamente detiene cuando status cambia a `ready` o `failed`

## Beneficios de Performance

### Antes (sin resume)

```
Usuario vuelve a la página
  ↓
Debe subir el archivo de nuevo
  ↓
Extracción de texto (OCR si es imagen): ~60 segundos
  ↓
Upload a storage: ~5 segundos
  ↓
Procesamiento OpenAI: ~90 segundos
  ↓
Total: ~155 segundos ❌
```

### Ahora (con resume)

```
Usuario vuelve a la página
  ↓
Ve "Resume Processing"
  ↓
Click en "Monitor"
  ↓
Polling cada 1.5 segundos
  ↓
Detecta cuando status = "ready"
  ↓
Total: ~1-3 segundos ✅
```

**Ahorro:**
- ⚡ **98% más rápido** para jobs ya procesados
- 📊 **100% menos tráfico** (no re-sube archivo)
- 💰 **Sin costos duplicados** de OpenAI

## Integraciones

### En add-question/page.tsx

```typescript
// 1. Cargar pending jobs
const { pendingJobs, refresh } = usePendingJobs()

// 2. Mostrar card si hay jobs
{pendingJobs.length > 0 && (
  <PendingJobsCard 
    jobs={pendingJobs}
    onResumeJob={resumeJob}
  />
)}

// 3. Refrescar después de submit
const handleSubmit = async () => {
  await createQuestionsBatch(...)
  refresh() // Actualizar lista
}
```

## Estados del Job

```typescript
type JobStatus = 
  | "pending"      // Creado, esperando procesamiento
  | "processing"   // Edge Function procesando
  | "ready"        // Completado exitosamente
  | "failed"       // Error durante procesamiento
```

**Visible en PendingJobsCard:**
- ✅ `pending`: ⚠️ Amarillo "Pending"
- ✅ `processing`: 🔵 Azul "Processing..." (spinner)
- ❌ `ready`: No se muestra (job completado)
- ❌ `failed`: No se muestra (job falló)

## Testing

### Caso de prueba 1: Job en processing

```typescript
// 1. Subir PDF largo (21+ páginas)
// 2. Esperar 30 segundos
// 3. Cerrar pestaña / navegar a otra página
// 4. Volver a /protected/add-question
// 5. Verificar: PendingJobsCard visible
// 6. Click "Monitor"
// 7. Verificar: Polling comienza, status se actualiza
```

### Caso de prueba 2: Job completado mientras usuario está ausente

```typescript
// 1. Subir PDF
// 2. Navegar a otra página inmediatamente
// 3. Esperar 90 segundos (procesamiento completo)
// 4. Volver a /protected/add-question
// 5. Verificar: PendingJobsCard NO visible (job ya está "ready")
// 6. Verificar: No aparece en lista de pending
```

### Caso de prueba 3: Múltiples jobs

```typescript
// 1. Subir PDF 1
// 2. Navegar a otra parte
// 3. Volver y subir PDF 2
// 4. Navegar a otra parte
// 5. Volver
// 6. Verificar: Ambos jobs en PendingJobsCard
// 7. Resumir cualquiera
// 8. Verificar: Solo ese job se muestra en FileUploadStatusCard
```

## Troubleshooting

### "No veo mi job en proceso"

**Posibles causas:**
1. Job ya terminó (status = "ready" o "failed")
2. Job es de otro usuario
3. Job tiene más de 5 en la lista (límite)

**Solución:**
```typescript
// Verificar en DB directamente
SELECT id, status, file_name, created_at 
FROM question_imports 
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC;
```

### "Resume no inicia polling"

**Causa:** Job ya está completado

**Verificar:**
```typescript
console.log("Job status:", job.status)
// Si status !== "pending" && status !== "processing"
// → Polling no se inicia (comportamiento correcto)
```

### "Polling no se detiene"

**Causa:** Bug en useEffect cleanup

**Solución:**
```typescript
// useQuestionImportJob.ts tiene cleanup
useEffect(() => () => stopPolling(), [])
```

## Próximas Mejoras

- [ ] **Auto-resume al cargar página**: Si hay 1 solo job pending, auto-resumir
- [ ] **Notificaciones**: Push notification cuando job termina
- [ ] **Progress bar**: Mostrar progreso estimado (páginas procesadas / total)
- [ ] **Cancelar job**: Botón para cancelar procesamiento en curso
- [ ] **Historial completo**: Ver todos los jobs (no solo pending)

## Referencias

- [usePendingJobs.ts](./hooks/usePendingJobs.ts) - Hook principal
- [getPendingJobs.actions.ts](./server/getPendingJobs.actions.ts) - Server action
- [PendingJobsCard.tsx](./components/PendingJobsCard.tsx) - Componente UI
- [useQuestionImportJob.ts](./hooks/useQuestionImportJob.ts) - Hook extendido
