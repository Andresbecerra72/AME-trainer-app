# Sistema de Votos (Upvotes/Downvotes)

## Estructura de Base de Datos

### Tabla `votes`
```sql
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  value int CHECK (value IN (-1, 1)),  -- -1 para downvote, 1 para upvote
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);
```

### Tabla `questions`
Tiene columnas: `upvotes`, `downvotes` que se actualizan cuando se vota.

## Flujo de Votación

### 1. Usuario vota en una pregunta
- **Componente:** `VoteButton` ([components/vote-button.tsx](../components/vote-button.tsx))
- **Función cliente:** Llama a `voteQuestion(questionId, value)` donde value es 1 o -1
- **Server Action:** `voteQuestion` en [lib/db-actions.ts](../lib/db-actions.ts#L154)

### 2. Lógica en el servidor
```typescript
// En lib/db-actions.ts
export async function voteQuestion(questionId: string, voteType: number) {
  // 1. Verifica si ya existe un voto del usuario para esa pregunta
  // 2. Si existe y es el mismo tipo: elimina el voto (toggle off)
  // 3. Si existe y es diferente: cambia el voto
  // 4. Si no existe: crea nuevo voto
  // 5. Actualiza los contadores upvotes/downvotes en la tabla questions
}
```

### 3. Problemas Encontrados

#### ❌ Inconsistencia en nombres de columnas:
- **Base de datos:** columna `value`
- **Código:** usa `vote_type` 

**Solución:** Actualizar el código para usar `value` en vez de `vote_type`.

#### ❌ Query en upvoted page:
- Usa `profiles:author_id (username, avatar_url)` pero `username` no existe
- Debe ser `display_name`

**Solución:** Creada feature separada en [features/votes/](../features/votes/)

## Nueva Estructura Implementada

### 📁 features/votes/
```
features/votes/
├── services/
│   └── votes.api.ts          # Server actions para obtener votos
└── components/
    └── UpvotedQuestionCard.tsx  # Componente para mostrar pregunta upvoteada
```

### Server Action: getUserUpvotedQuestions
```typescript
// features/votes/services/votes.api.ts
export async function getUserUpvotedQuestions(userId: string): Promise<UpvotedQuestion[]>
```
- Obtiene todas las preguntas que el usuario ha upvoteado (value = 1)
- Incluye información de topic y autor
- Usa nombres de columna correctos (display_name)

### Componente: UpvotedQuestionCard
- Muestra información de la pregunta upvoteada
- Fecha de upvote
- Stats (upvotes, comments)
- Responsive design

## Uso en Páginas

### Página de Upvoted Questions
**Ruta:** `/protected/profile/[id]/upvoted`

**Antes:**
- Mezclaba lógica de negocio con UI
- Queries directas de Supabase en el componente
- Usaba nombres de columna incorrectos

**Después:**
- Lógica de negocio en `features/votes/services/votes.api.ts`
- Componente de presentación en `features/votes/components/UpvotedQuestionCard.tsx`
- Queries correctas con nombres de columna actualizados
- Manejo de estados: loading, empty, error

## Correcciones Necesarias

### ⚠️ lib/db-actions.ts
Actualizar función `voteQuestion` para usar `value` en vez de `vote_type`:

```typescript
// ANTES
.eq("vote_type", voteType)

// DESPUÉS  
.eq("value", voteType)
```

### ⚠️ RPC Function
Si existe una función `vote_question` en la base de datos, verificar que use la columna correcta.

## Testing

1. ✅ Usuario puede ver sus preguntas upvoteadas
2. ✅ Información correcta de autor (display_name)
3. ✅ Fecha de upvote mostrada
4. ⚠️ Votar una pregunta (pendiente corrección en db-actions.ts)
5. ⚠️ Toggle vote (pendiente corrección)

## Próximos Pasos

1. Corregir `lib/db-actions.ts` para usar columna `value`
2. Verificar stored procedure `vote_question` si existe
3. Crear tests para el sistema de votos
4. Agregar feature de downvotes similar a upvotes
