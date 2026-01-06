# Bookmarks Feature - Documentation

## 📍 Navegación

### Cómo llegar a la página de Bookmarks:

1. **Desde cualquier pregunta:**
   - Tap en el ícono de bookmark (🔖) para guardar
   - Las preguntas guardadas aparecen en `/protected/bookmarks`

2. **Desde el perfil:**
   - Ve a tu perfil → ver "Saved Questions" o link directo

3. **URL directa:**
   - `/protected/bookmarks`

**Nota:** Actualmente NO hay navegación directa desde el BottomNav. Se recomienda agregar un tab o acceso desde el menú de usuario.

## 🏗️ Arquitectura

### Separación de Responsabilidades

```
features/bookmarks/
├── bookmarks.api.ts           # ✅ Business logic (Server Actions)
├── components/
│   └── BookmarkCard.tsx       # ✅ Presentational component
└── services/
    └── bookmarks.server.ts    # Legacy (mantener para compatibilidad)

app/protected/bookmarks/
└── page.tsx                   # ✅ Page component (solo orquestación)
```

### Server Actions Disponibles

#### `getUserBookmarks(userId: string)`
Obtiene todas las preguntas guardadas por el usuario.
- Returns: `BookmarkedQuestion[]`
- Incluye: question details, author, topic

#### `isQuestionBookmarked(userId: string, questionId: string)`
Verifica si una pregunta está guardada.
- Returns: `boolean`

#### `toggleBookmark(questionId: string)`
Agrega o elimina un bookmark.
- Returns: `{ success: boolean; isBookmarked: boolean }`
- Revalida `/protected/bookmarks`

#### `getBookmarkCount(userId: string)`
Cuenta el total de bookmarks del usuario.
- Returns: `number`

## 📱 Responsive Design

### BookmarkCard Component
- ✅ Responsive typography: `line-clamp-2 sm:line-clamp-3`
- ✅ Flexible gaps: `gap-3 sm:gap-4`
- ✅ Icon sizes: `w-5 h-5 sm:w-6 sm:h-6`
- ✅ Truncated text with `max-w-[150px] sm:max-w-none`
- ✅ Flex wrap para stats en móvil

### Page Layout
- ✅ Container: `max-w-3xl` (responsive)
- ✅ Padding: `px-4 py-4 sm:py-6`
- ✅ Spacing: `space-y-3 sm:space-y-4`
- ✅ Bottom padding para BottomNav: `pb-24`

## 🔄 Recomendaciones de Mejora

### 1. Agregar navegación en BottomNav
```tsx
// En components/bottom-nav.tsx
import { Bookmark } from "lucide-react"

const navItems = [
  // ... existing items
  {
    label: "Saved",
    icon: Bookmark,
    href: "/protected/bookmarks",
    active: pathname === "/protected/bookmarks",
  },
]
```

### 2. Mostrar badge con contador
```tsx
// En dashboard o profile
import { getBookmarkCount } from "@/features/bookmarks/bookmarks.api"

const count = await getBookmarkCount(user.id)
// Mostrar badge con count
```

### 3. Integrar en user menu
```tsx
// En components/user-menu.tsx
<DropdownMenuItem asChild>
  <Link href="/protected/bookmarks">
    <Bookmark className="mr-2 h-4 w-4" />
    <span>Saved Questions</span>
  </Link>
</DropdownMenuItem>
```

## 🔐 Seguridad

- ✅ Autenticación requerida (redirect si no user)
- ✅ RLS en tabla bookmarks (user_id check)
- ✅ Server Actions protegidos
- ✅ Unique constraint: (user_id, question_id)

## 🧪 Testing

Para probar la funcionalidad:
1. Navega a `/protected/community`
2. Busca una pregunta
3. Haz clic en el ícono de bookmark
4. Navega a `/protected/bookmarks`
5. Verifica que la pregunta aparece
6. Haz clic de nuevo en bookmark para remover
7. Refresh `/protected/bookmarks` para confirmar

## 📊 Estado Actual

| Feature | Status | Notes |
|---------|--------|-------|
| Backend API | ✅ | Completo en bookmarks.api.ts |
| Componentes | ✅ | BookmarkCard responsivo |
| Página | ✅ | Lógica separada |
| Navegación | ⚠️ | No hay link en BottomNav |
| Testing | ⚠️ | Requiere testing manual |
| TypeScript | ✅ | Sin errores |
| Responsive | ✅ | Mobile-first design |
