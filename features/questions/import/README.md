# Question Import Feature

Esta funcionalidad permite importar preguntas de tres formas diferentes:

1. **Manual**: Entrada individual de preguntas (modo original)
2. **Paste Text**: Importación masiva desde texto pegado
3. **Upload File**: Extracción automática desde archivos PDF/imágenes

## 📁 Estructura del Módulo

```
features/questions/import/
├── components/
│   ├── DraftQuestionCard.tsx       # Vista individual de pregunta draft
│   ├── DraftQuestionsList.tsx      # Lista de preguntas draft
│   ├── FormatExampleCard.tsx       # Guía de formato para paste
│   ├── FileUploadStatusCard.tsx    # Estados del upload (new)
│   ├── FileImportReviewCard.tsx    # Review de preguntas de archivo (new)
│   └── index.ts                     # Exports
├── hooks/
│   ├── useQuestionImport.ts        # Hook para paste text
│   └── useQuestionImportJob.ts     # Hook para file upload (new)
├── parsers/
│   ├── pasteText.parser.ts         # Parser para texto pegado
│   └── questionText.parser.ts      # Parser genérico de texto (new)
├── server/
│   └── questionImport.actions.ts   # Server actions (batch insert y process)
├── services/
│   └── questionImport.api.ts       # API cliente para jobs (new)
├── types.ts                         # Tipos compartidos
├── README.md                        # Este archivo
├── EXAMPLES.md                      # Ejemplos de formato
└── FILE_UPLOAD.md                   # Documentación detallada de upload (new)
```

## 🎯 Modo 1: Paste Text

Permite pegar múltiples preguntas en formato estructurado y revisarlas antes de enviar.

### Componentes

- **FormatExampleCard**: Muestra el formato esperado con botón de copiar
- **DraftQuestionsList**: Lista editable de preguntas parseadas
- **DraftQuestionCard**: Card individual con edición inline

### Flujo

1. Usuario pega texto en formato estructurado
2. Click en "Auto-Parse Questions"
3. Revisión y edición de preguntas
4. Selección de topic y difficulty
5. Submit batch a DB

Ver [EXAMPLES.md](./EXAMPLES.md) para formatos soportados.

## 🎯 Modo 2: Upload File (NEW)

Permite subir archivos PDF o imágenes para extracción automática de preguntas.

### Componentes Nuevos

- **FileUploadStatusCard**: Muestra estados del proceso (uploading, processing, ready, failed)
- **FileImportReviewCard**: Revisión de preguntas extraídas con validaciones

### Flujo

1. Usuario sube archivo (PDF/imagen)
2. Archivo se guarda en Supabase Storage
3. Job se crea en DB con status "pending"
4. Server action procesa archivo (extrae texto)
5. Parser detecta preguntas del texto
6. Job actualiza a "ready" con resultado
7. Polling detecta cambio y muestra review
8. Usuario revisa, edita, completa preguntas faltantes
9. Submit batch a DB

Ver [FILE_UPLOAD.md](./FILE_UPLOAD.md) para documentación completa.

## Componentes Principales

### DraftQuestionCard.tsx (Actualizado)
Componente que muestra cada pregunta parseada con:
- Vista previa de la pregunta y opciones
- Indicador de respuesta correcta con código de color
- Botón para editar (modo inline)
- Botón para eliminar
- Soporte para explicación opcional

### 2. `DraftQuestionsList.tsx`
Lista contenedora que:
- Muestra todas las preguntas parseadas
- Contador de preguntas encontradas
- Estado vacío cuando no hay preguntas
- Maneja actualizaciones y eliminaciones

## Flujo de Uso

### Paso 1: Pegar Texto
El usuario pega preguntas en el formato especificado:
```
Q: ¿Cuál es la capital de Francia?
A) Madrid
B) París
C) Londres
D) Berlín
Answer: B

Q: ¿Cuántos continentes hay?
A) 5
B) 6
C) 7
D) 8
Answer: C
```

### Paso 2: Auto-Parse
Al hacer clic en "Auto-Parse Questions":
- El texto se parsea usando `parsePastedQuestions()`
- Se valida que haya al menos una pregunta válida
- Se muestra un toast con el número de preguntas encontradas
- Se cambia a la vista de revisión

### Paso 3: Revisar y Editar
El usuario puede:
- Ver todas las preguntas parseadas
- Editar cualquier campo de cada pregunta
- Eliminar preguntas no deseadas
- Seleccionar el topic para todas las preguntas
- Elegir el nivel de dificultad para el batch

### Paso 4: Enviar
Al hacer clic en "Submit X Questions":
- Se valida que haya un topic seleccionado
- Se envían todas las preguntas editadas al servidor
- Se crean en estado "pending" para revisión
- Se redirige al dashboard

## Formato Soportado

El parser reconoce:
- Pregunta: `Q:` o `Question:`
- Opciones: `A)`, `B)`, `C)`, `D)` (también soporta `.` y `:`)
- Respuesta: `Answer:` o `Correct:` seguido de A, B, C o D
- Explicación (opcional): `Explanation:` seguida del texto

**Importante:** Las preguntas deben estar separadas por líneas en blanco.

## Manejo de Estado

```typescript
// Estado local en la página
const [editableDrafts, setEditableDrafts] = useState<DraftQuestion[]>([])
const [showParsedQuestions, setShowParsedQuestions] = useState(false)
const [batchTopic, setBatchTopic] = useState("")
const [batchDifficulty, setBatchDifficulty] = useState<"easy" | "medium" | "hard">("medium")

// Del hook
const { pastedText, setPastedText, drafts, submitPaste, isSubmitting } = useQuestionImport()
```

## Server Actions

### `createQuestionsBatch`
Recibe:
- `topic_id`: ID del topic seleccionado
- `difficulty`: Nivel de dificultad
- `questions`: Array de `DraftQuestion`

Retorna:
- `{ inserted: number }`: Cantidad de preguntas insertadas

## Validaciones

1. **En el parse:**
   - Debe tener texto en el campo
   - Debe encontrar al menos una pregunta válida
   
2. **Antes de enviar:**
   - Topic obligatorio
   - Al menos una pregunta en el batch
   
3. **En el servidor:**
   - Cada pregunta debe tener todos los campos requeridos
   - Se asigna status "pending" para revisión

## Mejoras Futuras Posibles

- [ ] Soporte para más formatos de entrada
- [ ] Preview antes de parse con highlighting
- [ ] Drag & drop para reordenar preguntas
- [ ] Asignar topics individuales por pregunta
- [ ] Importar desde archivo (.txt, .docx)
- [ ] Detección de duplicados antes de insertar
- [ ] Historial de imports
