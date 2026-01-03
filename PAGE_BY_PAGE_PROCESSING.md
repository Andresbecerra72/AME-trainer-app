# Procesamiento por Páginas - Solución al Truncamiento de JSON

## Problema Resuelto

**Error original:**
```
JSON parse error: SyntaxError: Unterminated string in JSON at position 16234
```

Este error ocurría cuando documentos largos generaban respuestas de OpenAI que excedían el límite de `max_tokens`, causando que el JSON se truncara a la mitad.

## Solución Implementada

### 1. **Extracción por Páginas (Cliente)**

El archivo `textExtraction.ts` ahora extrae texto página por página:

```typescript
export async function extractPdfText(file: File): Promise<{
  fullText: string  // Texto completo combinado
  pages: string[]   // Array de páginas individuales
}>
```

**Ventajas:**
- ✅ Cada página se procesa independientemente
- ✅ No hay límite de tamaño del documento
- ✅ Mejor manejo de errores (una página fallida no detiene el proceso)
- ✅ Logs detallados por página

### 2. **Almacenamiento en DB**

Nueva columna `raw_pages` (JSONB) en `question_imports`:

```sql
ALTER TABLE question_imports 
ADD COLUMN raw_pages JSONB DEFAULT NULL;
```

**Campos:**
- `raw_text`: Texto completo (para retrocompatibilidad y búsqueda)
- `raw_pages`: Array de páginas individuales (para procesamiento)

### 3. **Procesamiento Inteligente (Edge Function)**

La Edge Function detecta automáticamente si usar modo página por página:

```typescript
const usePageByPage = pages && pages.length > 0

if (usePageByPage) {
  // Procesa página por página con gpt-4o-mini (rápido y económico)
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    // Extrae preguntas de esta página
    // Acumula resultados
  }
} else {
  // Modo tradicional: todo el documento en una llamada
  // Usa gpt-4-turbo-preview o gpt-4o según tamaño
}
```

**Ventajas del modo página por página:**
- ✅ Usa `gpt-4o-mini` (más rápido y 60% más barato)
- ✅ Cada respuesta es pequeña (no se trunca)
- ✅ Paralelizable en el futuro (procesar múltiples páginas simultáneamente)
- ✅ Mejor manejo de errores por página

## Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENTE: Extracción de Texto                                │
├─────────────────────────────────────────────────────────────────┤
│   extractPdfText(file)                                          │
│   ├─ Extrae página 1 → "1. ¿Pregunta...?"                      │
│   ├─ Extrae página 2 → "5. ¿Pregunta...?"                      │
│   ├─ Extrae página 3 → "10. ¿Pregunta...?"                     │
│   └─ Retorna: { fullText, pages: [...] }                       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SERVER ACTION: Almacenamiento                               │
├─────────────────────────────────────────────────────────────────┤
│   uploadTextExtract()                                           │
│   └─ INSERT INTO question_imports                              │
│      - raw_text: texto completo                                │
│      - raw_pages: ["página 1", "página 2", ...]                │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EDGE FUNCTION: Procesamiento                                │
├─────────────────────────────────────────────────────────────────┤
│   IF raw_pages exists:                                          │
│   ├─ FOR EACH página:                                           │
│   │   ├─ Enviar a OpenAI (gpt-4o-mini)                         │
│   │   ├─ Extraer preguntas de esta página                      │
│   │   └─ Acumular resultados                                   │
│   └─ Retornar: todas las preguntas                             │
│                                                                 │
│   ELSE:                                                         │
│   └─ Procesar raw_text completo en una llamada                 │
└─────────────────────────────────────────────────────────────────┘
```

## Migración de DB

### Aplicar Migración

**Opción 1: Supabase CLI**
```bash
psql -h [db-host] -U postgres -d postgres -f scripts/011_add_raw_pages_column.sql
```

**Opción 2: Supabase Dashboard**
1. Ve a SQL Editor
2. Copia el contenido de `scripts/011_add_raw_pages_column.sql`
3. Ejecuta

**Opción 3: Supabase CLI local**
```bash
supabase db reset  # Si estás en desarrollo local
# o
supabase migration new add_raw_pages_column
# Luego copia el SQL al nuevo archivo de migración
```

### Verificar Migración

```sql
-- Verificar que la columna existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'question_imports' 
AND column_name = 'raw_pages';

-- Verificar índice
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'question_imports' 
AND indexname = 'idx_question_imports_has_pages';
```

## Configuración y Uso

### No Requiere Configuración

El sistema automáticamente:
1. ✅ Detecta si `raw_pages` está presente
2. ✅ Usa procesamiento por páginas cuando está disponible
3. ✅ Cae a modo tradicional si no hay páginas

### Retrocompatibilidad

- ✅ Documentos antiguos sin `raw_pages` siguen funcionando
- ✅ El campo es opcional (DEFAULT NULL)
- ✅ No requiere reprocesar documentos existentes

## Monitoreo y Logs

### Logs del Cliente (Browser Console)

```
PDF loaded: 5 pages
Page 1: extracted 2845 characters
Page 2: extracted 3102 characters
...
Pages breakdown: P1:2845ch, P2:3102ch, P3:2691ch...
```

### Logs de Edge Function

```
📄 Page-by-page mode: 5 pages detected
Pages sizes: P1:2845ch, P2:3102ch, P3:2691ch, P4:2503ch, P5:1904ch

🔄 Starting page-by-page processing...

--- Processing page 1/5 (2845 chars) ---
Page 1: ~711 input tokens, model: gpt-4o-mini
✓ Page 1: Extracted 3 questions

--- Processing page 2/5 (3102 chars) ---
Page 2: ~775 input tokens, model: gpt-4o-mini
✓ Page 2: Extracted 4 questions

...

✓ Page-by-page processing complete: 18 total questions from 5 pages
Total tokens used: 12,450
```

## Comparación de Rendimiento

### Modo Tradicional (Single Chunk)

```
Documento de 20 páginas = ~50,000 caracteres
↓
1 llamada a gpt-4o (16,000 max_tokens)
↓
Costo: ~$0.15
Tiempo: ~30 segundos
Riesgo de truncamiento: ALTO ⚠️
```

### Modo Página por Página (Nuevo)

```
Documento de 20 páginas = 20 páginas individuales
↓
20 llamadas a gpt-4o-mini (4,096 max_tokens cada una)
↓
Costo: ~$0.06 (60% más barato)
Tiempo: ~25 segundos (paralelizable en el futuro)
Riesgo de truncamiento: NULO ✅
```

## Casos de Uso

### ✅ Ideal Para:

- PDFs largos (>10 páginas)
- Documentos con muchas preguntas
- Archivos donde cada página es independiente
- Evitar errores de truncamiento

### 🤔 Considera Modo Tradicional Para:

- Documentos muy cortos (1-3 páginas)
- Cuando las preguntas cruzan páginas
- Archivos de texto plano (no PDFs)

## Próximas Mejoras

- [ ] Procesamiento paralelo de páginas (Promise.all)
- [ ] Configuración de batch size (procesar N páginas a la vez)
- [ ] Reintento automático de páginas fallidas
- [ ] Caché de páginas ya procesadas
- [ ] Estadísticas por página en el dashboard

## Troubleshooting

### "No questions extracted" con páginas individuales

**Causa:** Una página individual no tiene preguntas completas (preguntas divididas entre páginas).

**Solución:** Implementar "contexto de página" (incluir últimas líneas de página anterior).

### Columna raw_pages no existe

**Solución:** Ejecutar migración `011_add_raw_pages_column.sql`

### Modo página por página no se activa

**Verificar:**
1. ¿La migración se aplicó? → `SELECT raw_pages FROM question_imports LIMIT 1`
2. ¿El cliente envía páginas? → Revisar logs del browser
3. ¿El servidor guarda páginas? → Revisar logs de `uploadTextExtract`

## Referencias

- [textExtraction.ts](../features/questions/import/utils/textExtraction.ts) - Extracción cliente
- [questionImport.actions.ts](../features/questions/import/server/questionImport.actions.ts) - Server action
- [index.ts](../supabase/functions/parse-import-job/index.ts) - Edge function
- [011_add_raw_pages_column.sql](../scripts/011_add_raw_pages_column.sql) - Migración DB
