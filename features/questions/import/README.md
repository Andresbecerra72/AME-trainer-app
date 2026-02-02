# Question Import - Progress & Notifications

Sistema completo de importación de preguntas con barra de progreso, manejo de errores y notificaciones.

## Componentes

### `ImportProgressBar`

Barra de progreso visual para mostrar el estado del import.

**Props:**
```typescript
interface ImportProgressBarProps {
  progress: ImportProgress
  className?: string
}

interface ImportProgress {
  status: "idle" | "extracting" | "uploading" | "processing" | "ready" | "failed"
  currentPage?: number
  totalPages?: number
  questionsExtracted?: number
  percentage?: number
  error?: string
  warnings?: string[]
  message?: string
}
```

**Uso:**
```tsx
import { ImportProgressBar } from "@/features/questions/import"

<ImportProgressBar 
  progress={{
    status: "processing",
    currentPage: 5,
    totalPages: 21,
    questionsExtracted: 22,
    percentage: 24
  }} 
/>
```

### `QuestionImportForm`

Formulario completo con selector de archivo, progreso y notificaciones integradas.

**Uso:**
```tsx
import { QuestionImportForm } from "@/features/questions/import"

export default function ImportPage() {
  return <QuestionImportForm />
}
```

## Hooks

### `useQuestionImportJob`

Hook principal para manejar uploads e imports con progreso automático.

```tsx
import { useQuestionImportJob } from "@/features/questions/import"

function MyComponent() {
  const {
    job,                    // Estado actual del job
    isUploading,           // Está subiendo archivo
    isExtracting,          // Está extrayendo texto
    extractionProgress,    // Mensaje de progreso
    error,                 // Error si existe
    progressDetails,       // Detalles de progreso (páginas, preguntas)
    startUpload,           // Iniciar upload
    resumeJob,             // Reanudar job existente
    deleteJob,             // Cancelar/eliminar job
  } = useQuestionImportJob()

  return (
    <div>
      {progressDetails && (
        <p>
          Page {progressDetails.currentPage} of {progressDetails.totalPages}
          - {progressDetails.questionsExtracted} questions
        </p>
      )}
    </div>
  )
}
```

### `useImportProgress`

Hook standalone para polling de progreso (si no usas `useQuestionImportJob`).

```tsx
import { useImportProgress } from "@/features/questions/import"

const { progress, stopPolling, restartPolling } = useImportProgress({
  jobId: "job-id",
  onComplete: (questionsExtracted) => {
    console.log(`Completed! ${questionsExtracted} questions`)
  },
  onError: (error) => {
    console.error("Error:", error)
  },
  pollingInterval: 2000, // opcional, default 2000ms
})
```

### `useImportNotifications`

Hook para notificaciones del navegador cuando el usuario no está en la página.

```tsx
import { useImportNotifications } from "@/features/questions/import"

const { 
  notifyCompletion, 
  notifyError, 
  notifyWarning,
  hasNotificationPermission 
} = useImportNotifications({
  jobId: "job-id",
  enabled: true,
})

// Llamar manualmente
notifyCompletion(22) // "Import completed! 22 questions extracted"
notifyError("OpenAI timeout")
notifyWarning("Some pages timed out")
```

## Flujo Completo

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useQuestionImportJob, ImportProgressBar, ImportProgress } from "@/features/questions/import"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const { 
    job,
    isUploading,
    isExtracting,
    extractionProgress,
    progressDetails,
    error,
    startUpload 
  } = useQuestionImportJob()

  // Mapear estado a ImportProgress
  const getProgress = (): ImportProgress => {
    if (isExtracting) {
      return { status: "extracting", message: extractionProgress }
    }
    if (isUploading) {
      return { status: "uploading" }
    }
    if (job?.status === "processing") {
      return {
        status: "processing",
        currentPage: progressDetails?.currentPage,
        totalPages: progressDetails?.totalPages,
        questionsExtracted: progressDetails?.questionsExtracted,
        percentage: progressDetails?.percentage,
        warnings: progressDetails?.warnings,
      }
    }
    if (job?.status === "ready") {
      return {
        status: "ready",
        questionsExtracted: progressDetails?.questionsExtracted,
      }
    }
    if (job?.status === "failed") {
      return {
        status: "failed",
        error: job.error || error || undefined,
      }
    }
    return { status: "idle" }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button
        onClick={() => file && startUpload(file)}
        disabled={!file || isUploading || isExtracting}
      >
        Upload
      </Button>

      <ImportProgressBar progress={getProgress()} />
    </div>
  )
}
```

## Características

✅ **Progreso en tiempo real**: Polling cada 2 segundos con detalles de páginas procesadas y preguntas extraídas

✅ **Notificaciones del navegador**: Si el usuario sale de la página, recibe notificación cuando termina el import

✅ **Manejo de errores**: Muestra errores detallados con sugerencias

✅ **Advertencias**: Detecta cuando páginas timeout pero el job continúa

✅ **Responsive**: UI adaptable a móvil y desktop

✅ **Cancellation**: Permite cancelar imports en progreso

✅ **Arquitectura limpia**: Feature-based, separación de concerns

## Server Actions

### `pollImportJobStatus`

```typescript
const status = await pollImportJobStatus(jobId)
// Returns:
// {
//   status: "processing" | "ready" | "failed",
//   progress: { current: 5, total: 21, percentage: 24 },
//   questionsExtracted: 22,
//   error?: string,
//   done: boolean
// }
```

## Personalización

### Cambiar intervalo de polling

```tsx
// En useQuestionImportJob, línea ~70
pollRef.current = window.setInterval(async () => {
  // ...
}, 3000) // Cambiar de 2000 a 3000ms
```

### Personalizar colores de progreso

```tsx
// En ImportProgressBar.tsx
const getStatusColor = () => {
  switch (status) {
    case "ready":
      return "bg-green-500" // Cambiar aquí
    // ...
  }
}
```

### Agregar más warnings

```tsx
// En useQuestionImportJob, método beginPolling
if (/* condición */) {
  const warningMsg = "Tu mensaje"
  if (!warningsShownRef.current.has(warningMsg)) {
    notifyWarning(warningMsg)
    warningsShownRef.current.add(warningMsg)
  }
}
```

## Testing

```bash
# 1. Iniciar Edge Functions
npx supabase functions serve --env-file supabase/functions/.env.local

# 2. Subir PDF de prueba
# 3. Observar logs en terminal
# 4. Verificar notificaciones en UI

# Ver progreso en DB:
docker exec supabase_db_ame-app-v1 psql -U postgres -d postgres -c \
  "SELECT id, status, completed_pages, total_pages, 
   array_length(result, 1) as questions_extracted 
   FROM question_imports ORDER BY created_at DESC LIMIT 5;"
```

## Troubleshooting

**No aparecen notificaciones del navegador:**
- Verificar que el usuario aceptó permisos de notificaciones
- Comprobar `hasNotificationPermission` en el hook

**Progreso no se actualiza:**
- Verificar que Edge Functions están corriendo
- Ver logs en terminal de Edge Functions
- Comprobar `pollImportJobStatus` en Network tab

**Warnings de timeout:**
- Normal si OpenAI tarda >60s
- El job continúa con otras páginas
- Al final se reintentarán las páginas fallidas (futuro)

---

**Última actualización**: 2026-01-26
