# Upload File Feature - Question Import

Esta funcionalidad permite importar preguntas desde archivos PDF o imágenes mediante extracción de texto y parsing automático.

## Componentes Creados

### 1. `FileUploadStatusCard.tsx`
Componente que muestra el estado del proceso de importación:

**Estados soportados:**
- **Uploading**: Archivo siendo subido con barra de progreso
- **Processing**: Extrayendo texto y parseando preguntas
- **Ready**: Archivo procesado exitosamente con contador de preguntas
- **Failed**: Error en el proceso con mensaje descriptivo

**Props:**
- `job: QuestionImportJob | null` - El job de importación actual
- `isUploading: boolean` - Estado de carga
- `error: string | null` - Mensaje de error si existe

### 2. `FileImportReviewCard.tsx`
Componente para revisar y editar las preguntas extraídas del archivo:

**Características:**
- Alertas para preguntas incompletas (sin respuesta correcta)
- Indicador de preguntas completas
- Selector de topic y dificultad para el batch
- Lista editable de preguntas con `DraftQuestionsList`
- Validación antes de enviar

**Props:**
- `questions: DraftQuestion[]` - Preguntas extraídas
- `topics: any[]` - Lista de topics disponibles
- `onSubmit: (payload) => Promise<void>` - Handler para enviar
- `isSubmitting: boolean` - Estado de envío

### 3. `DraftQuestionCard` (Actualizado)
Mejorado para soportar:
- `correct_answer` nullable (cuando no se detecta en el archivo)
- Badge de "Missing Answer" para preguntas incompletas
- Badge de "Low Confidence" para detecciones con baja confianza
- Highlight visual para preguntas incompletas
- Mensaje de validación en modo edición

## Flujo Completo

### 1. Upload
```typescript
// Usuario selecciona archivo
startUpload(file) // Del hook useQuestionImportJob
  ↓
// Se crea job en DB con status "pending"
createImportJob({ userId, filePath: "pending", fileName, fileMime })
  ↓
// Se sube archivo a Supabase Storage
uploadImportFile({ userId, file, jobId })
  ↓
// Se actualiza job con ruta real
update({ file_path: path })
```

### 2. Processing
```typescript
// Se procesa el archivo (server action)
processImportJob(jobId)
  ↓
// Se marca como "processing"
update({ status: "processing" })
  ↓
// Se extrae texto (TODO: implementar para PDF e imágenes)
extractText(filePath)
  ↓
// Se parsean preguntas del texto
parseQuestionsFromText(extractedText)
  ↓
// Se guarda resultado
update({ 
  status: "ready", 
  raw_text: extractedText,
  result: drafts,
  stats: { detected: drafts.length }
})
```

### 3. Polling
El hook `useQuestionImportJob` hace polling cada 1.5 segundos hasta que el estado sea "ready" o "failed".

### 4. Review & Submit
```typescript
// Usuario revisa y edita preguntas
<FileImportReviewCard questions={job.result} ... />
  ↓
// Usuario puede:
// - Editar cualquier pregunta
// - Eliminar preguntas no deseadas
// - Seleccionar topic y difficulty
// - Completar respuestas faltantes
  ↓
// Enviar batch
createQuestionsBatch({
  topic_id,
  difficulty,
  questions: editedDrafts
})
  ↓
// Preguntas insertadas con status "pending"
// Redirige a dashboard
```

## Arquitectura del Sistema

### Database Schema
```sql
CREATE TABLE question_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_mime TEXT,
  status TEXT NOT NULL, -- 'pending' | 'processing' | 'ready' | 'failed'
  raw_text TEXT,
  result JSONB, -- DraftQuestion[]
  stats JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Storage Bucket
- **Nombre**: `question-imports`
- **Path**: `{userId}/{jobId}/{fileName}`
- **Tipos permitidos**: PDF, imágenes (jpg, png, etc.)

### Tipos TypeScript
```typescript
type ImportJobStatus = "pending" | "processing" | "ready" | "failed"

type DraftQuestion = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D" | null // Nullable!
  explanation?: string
  confidence?: number // 0-1, opcional
}

type QuestionImportJob = {
  id: string
  user_id: string
  file_path: string
  file_name: string | null
  file_mime: string | null
  status: ImportJobStatus
  raw_text: string | null
  result: DraftQuestion[] | null
  stats: Record<string, any> | null
  error: string | null
  created_at: string
  updated_at: string
}
```

## Hooks

### `useQuestionImportJob(userId: string | null)`
Hook principal para manejar el ciclo de vida del import.

**Returns:**
- `job: QuestionImportJob | null` - Job actual
- `isUploading: boolean` - Si está subiendo
- `error: string | null` - Error si existe
- `startUpload: (file: File) => Promise<void>` - Iniciar upload

**Características:**
- Crea job en DB
- Sube archivo a Storage
- Inicia procesamiento
- Hace polling automático
- Limpia polling al desmontar

## Server Actions

### `processImportJob(jobId: string)`
Procesa un archivo subido.

**Flujo:**
1. Marca job como "processing"
2. Descarga archivo de Storage (TODO: implementar)
3. Extrae texto según tipo de archivo
4. Parsea preguntas con `parseQuestionsFromText()`
5. Actualiza job con resultado o error

**Nota:** Actualmente es un placeholder. La extracción real de PDF/imágenes debe implementarse en Fase 2.

### `createQuestionsBatch(payload)`
Inserta preguntas en batch (compartido con Paste Text).

## Parser

### `parseQuestionsFromText(raw: string): DraftQuestion[]`
Parser básico que detecta preguntas en formato estructurado.

**Patrones soportados:**
- `Q:` o `Question:` para pregunta
- `A)`, `B)`, `C)`, `D)` para opciones (también `.` y `:`)
- `Answer:` o `Correct:` para respuesta

**Nota:** Si no detecta la respuesta correcta, devuelve `correct_answer: null` y `confidence: 0.55`. Si la detecta, `confidence: 0.85`.

## Validaciones

1. **Upload:**
   - Usuario debe estar autenticado
   - Archivo debe ser PDF o imagen

2. **Processing:**
   - Formato de archivo soportado
   - Texto extraído no vacío

3. **Review:**
   - Al menos una pregunta en el batch
   - Topic seleccionado
   - Todas las preguntas deben tener `correct_answer` válido

4. **Submit:**
   - Mismo que Paste Text (status "pending" en DB)

## UI/UX

### Estados Visuales
- **Upload Area**: Solo visible si no hay job o si falló
- **Status Card**: Siempre visible cuando hay actividad
- **Review Card**: Solo cuando job.status === "ready" y hay preguntas

### Indicadores
- ✅ **Verde**: Proceso exitoso
- 🟡 **Amarillo**: Procesando o advertencias
- 🔵 **Azul**: Subiendo
- 🔴 **Rojo**: Error

### Badges en preguntas
- **Answer: X**: Respuesta correcta detectada (color según letra)
- **Missing Answer**: Sin respuesta (amarillo)
- **Low Confidence**: Detección con baja confianza (<0.7)

## TODO - Fase 2

- [ ] **Extracción de PDF**: Implementar descarga desde Storage y extracción de texto
- [ ] **OCR para imágenes**: Integrar servicio OCR (Tesseract, Google Vision, etc.)
- [ ] **Parser mejorado**: ML/AI para mejor detección de preguntas
- [ ] **Preview del archivo**: Mostrar contenido original junto a preguntas parseadas
- [ ] **Batch status**: Dashboard para ver historial de imports
- [ ] **Auto-save drafts**: Guardar progreso sin enviar
- [ ] **Mapping inteligente**: Detectar topics automáticamente
- [ ] **Detección de duplicados**: Verificar antes de insertar

## Ejemplo de Uso

```tsx
// En la página
const { user } = useUser()
const { job, isUploading, error, startUpload } = useQuestionImportJob(user?.id ?? null)

// Input file
<input 
  type="file" 
  accept="application/pdf,image/*" 
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) startUpload(file)
  }}
/>

// Mostrar estado
<FileUploadStatusCard job={job} isUploading={isUploading} error={error} />

// Mostrar review cuando esté listo
{job?.status === "ready" && job.result && (
  <FileImportReviewCard
    questions={job.result}
    topics={topics}
    onSubmit={handleSubmitFileImport}
    isSubmitting={isSubmitting}
  />
)}
```

## Notas de Implementación

1. **Service Role**: Para descargar archivos desde Storage en server actions, necesitarás el service role key
2. **Rate Limiting**: Considera limitar uploads por usuario/día
3. **File Size**: Configurar límite en Storage y validar en cliente
4. **Cleanup**: Job antiguo podría limpiarse automáticamente con un cron
5. **Progress**: Para archivos grandes, considerar chunks y progress real

## Testing

### Casos a probar:
- Upload de PDF con preguntas válidas
- Upload de imagen (cuando se implemente OCR)
- Archivo sin preguntas válidas
- Formato incorrecto de preguntas
- Conexión interrumpida durante upload
- Preguntas sin respuesta correcta
- Edición de preguntas antes de submit
- Eliminación de preguntas del batch
- Submit sin seleccionar topic
- Submit con preguntas incompletas
