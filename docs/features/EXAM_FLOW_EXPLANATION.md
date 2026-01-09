# Flujo de Exámenes - Explicación Completa

## 🔍 Problema Identificado

Anteriormente, la página de resultados no mostraba datos porque:

1. ❌ **topicPerformance no se calculaba** en `exam-run-client.tsx`
2. ❌ **topicIds no se pasaban** correctamente de run → results
3. ❌ **Faltaban logs** para debugging
4. ⚠️ **topics.name podía ser undefined** (dependía de join en query)

## ✅ Solución Implementada

### 1. Flujo Completo de Datos

```
Setup Page (Server)
    ↓ (pasa topicIds via URL params)
Run Page (Server)
    ↓ (obtiene questions con topic info)
ExamRunClient (Client)
    ↓ (calcula results + topicPerformance + guarda en sessionStorage)
Results Page (Client)
    ↓ (lee sessionStorage + guarda en DB)
Exam History (guardado en Supabase)
```

### 2. Estructura de Datos

#### A) **ExamRunClient → sessionStorage**

```typescript
{
  score: 85,                    // Porcentaje total
  totalQuestions: 20,
  correctAnswers: 17,
  wrongAnswers: 3,
  skippedAnswers: 0,
  timeSpent: 15.5,             // En minutos
  topicPerformance: [          // ✅ Ahora calculado correctamente
    {
      topic: "Mathematics and Physics",
      correct: 8,
      total: 10,
      percentage: 80
    },
    {
      topic: "Hydraulic Systems",
      correct: 9,
      total: 10,
      percentage: 90
    }
  ],
  userAnswers: [               // Para review
    {
      questionId: "uuid-1",
      userAnswer: "A",
      correctAnswer: "A",
      isCorrect: true
    },
    ...
  ],
  topicIds: ["uuid-topic-1", "uuid-topic-2"]  // ✅ Ahora incluido
}
```

#### B) **Results Page → Supabase**

```typescript
// Se guarda en tabla exam_history
{
  user_id: "uuid-user",
  topic_ids: ["uuid-topic-1", "uuid-topic-2"],  // Array de UUIDs
  question_count: 20,
  correct_answers: 17,
  incorrect_answers: 3,
  score_percentage: 85,
  time_taken: 930,             // En segundos (15.5 * 60)
  completed_at: "2026-01-03T..."
}
```

### 3. Esquema de Base de Datos

```sql
-- Tabla: exam_history
CREATE TABLE IF NOT EXISTS public.exam_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_ids UUID[],                    -- Array de topic IDs
  question_count INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken INTEGER,                  -- en segundos
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Cambios Realizados

#### A) `exam-run-client.tsx`

**Antes:**
```typescript
// ❌ No calculaba topicPerformance
// ❌ No pasaba topicIds
sessionStorage.setItem("examResults", JSON.stringify({
  score, totalQuestions, correctAnswers, wrongAnswers,
  skippedAnswers, timeSpent, results, questions
}))
```

**Después:**
```typescript
// ✅ Calcula topicPerformance agrupando por topic_id
const topicPerformanceMap = new Map()
questions.forEach((q, idx) => {
  const topicId = q.topic_id
  const topicName = q.topics?.name || "Unknown Topic"
  // ... agrupa y cuenta correct/total por topic
})

// ✅ Incluye topicPerformance y topicIds
sessionStorage.setItem("examResults", JSON.stringify({
  score, totalQuestions, correctAnswers, wrongAnswers,
  skippedAnswers, timeSpent, topicPerformance, userAnswers, topicIds
}))
```

#### B) `results/page.tsx`

**Antes:**
```typescript
// ❌ Intentaba leer topicIds de searchParams (no estaban ahí)
const topicIds = searchParams.get("topicIds")?.split(",") || []
```

**Después:**
```typescript
// ✅ Lee topicIds desde results (incluidos en sessionStorage)
const topicIds = (results as any).topicIds || []
console.log("[ExamResults] Saving exam history:", { topic_ids: topicIds, ... })
```

#### C) `run/page.tsx`

**Antes:**
```typescript
return <ExamRunClient questions={questions} timerEnabled={timerEnabled} questionCount={questionCount} />
```

**Después:**
```typescript
// ✅ Pasa topicIds al componente cliente
return <ExamRunClient 
  questions={questions} 
  timerEnabled={timerEnabled} 
  questionCount={questionCount}
  topicIds={topicIds}
/>
```

### 5. Logs de Debugging

Ahora hay logs en puntos clave:

```typescript
// En ExamRunClient
console.log("[ExamRunClient] Submitting exam with results:", examResults)

// En Results Page (useEffect de carga)
console.log("[ExamResults] Stored results:", stored)
console.log("[ExamResults] Parsed results:", parsedResults)

// En Results Page (useEffect de guardado)
console.log("[ExamResults] Saving exam history:", { topic_ids, ... })
console.log("[ExamResults] Exam history saved successfully")
console.error("[ExamResults] Error saving exam history:", error)
```

## 🧪 Cómo Validar que Funciona

### 1. Verificar que se muestran los resultados

1. Inicia un examen desde `/protected/exam/setup`
2. Responde algunas preguntas
3. Haz submit
4. **Deberías ver:**
   - ✅ Score en grande
   - ✅ Summary (Correct/Wrong/Skipped)
   - ✅ Performance by Topic (con barras de progreso)
   - ✅ Botones: Review Answers, Retake Exam, Home

### 2. Verificar que se guarda en la base de datos

**Opción A: Desde Supabase Dashboard**
```sql
-- Ve a tu proyecto Supabase → SQL Editor
SELECT * FROM exam_history 
ORDER BY completed_at DESC 
LIMIT 10;
```

**Opción B: Desde Console del navegador**
```javascript
// En la página de Results, abre DevTools → Console
// Verás logs como:
// [ExamResults] Saving exam history: { topic_ids: [...], ... }
// [ExamResults] Exam history saved successfully
```

**Opción C: Usando la función del código**
```typescript
// En cualquier server component o action
import { getExamHistory } from "@/lib/db-actions"

const history = await getExamHistory(userId, 10)
console.log("Last 10 exams:", history)
```

### 3. Verificar el flujo completo

1. **Setup** → Selecciona rating y categoría
2. **Run** → Responde preguntas (verás timer si está habilitado)
3. **Submit** → Abre DevTools Console antes de hacer submit
4. **Results** → Verifica:
   - Los datos se muestran correctamente
   - Hay logs en Console mostrando el guardado
   - No hay errores en Console

## 📊 Visualización de Historial

Para mostrar el historial en alguna página (ej: Analytics o Profile):

```typescript
import { getExamHistory } from "@/lib/db-actions"

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/auth/login")
  
  const history = await getExamHistory(user.id, 20)
  
  return (
    <div>
      <h2>Tu Historial de Exámenes</h2>
      {history.map(exam => (
        <div key={exam.id}>
          <p>Score: {exam.score_percentage}%</p>
          <p>Preguntas: {exam.question_count}</p>
          <p>Correctas: {exam.correct_answers}</p>
          <p>Fecha: {new Date(exam.completed_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}
```

## 🐛 Troubleshooting

### Problema: "No results found, redirecting"

**Causa:** sessionStorage vacío  
**Solución:** 
- Verifica que completes el examen correctamente (no recargues la página en medio)
- sessionStorage se borra si cambias de dominio o cierras el tab

### Problema: "Could not save exam history"

**Causa:** Error en Supabase  
**Soluciones:**
1. Verifica que la tabla `exam_history` exista:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'exam_history';
   ```

2. Verifica las RLS policies:
   ```sql
   -- Debe permitir INSERT para usuarios autenticados
   SELECT * FROM pg_policies 
   WHERE tablename = 'exam_history';
   ```

3. Verifica que los topicIds sean válidos:
   ```sql
   SELECT id, name FROM topics WHERE id = ANY(ARRAY['uuid-1', 'uuid-2']);
   ```

### Problema: topicPerformance vacío

**Causa:** questions no tienen `topics.name`  
**Solución:** Asegúrate que el query en `fetchExamData` incluya el join:
```typescript
.select(`
  *,
  topics(name)
`)
```

## 📝 Notas Importantes

1. **sessionStorage** es por tab/ventana - se borra al cerrar
2. **timeSpent** se guarda en **segundos** en DB pero se muestra en **minutos** en UI
3. **topic_ids** es un **array de UUIDs** en Postgres (tipo `UUID[]`)
4. **score_percentage** es tipo `DECIMAL(5,2)` - permite hasta 999.99
5. Los **logs** solo se ven en development - considera removerlos en producción

## 🎯 Próximos Pasos Sugeridos

1. [ ] Crear página de Analytics que muestre historial
2. [ ] Agregar gráficas de progreso temporal
3. [ ] Comparar performance entre diferentes ratings/categorías
4. [ ] Implementar badges basados en exam_history
5. [ ] Exportar resultados a PDF
6. [ ] Compartir resultados en redes sociales
