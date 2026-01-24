# Duplicate Detection System

## Overview
Sistema avanzado de detección de preguntas duplicadas con interfaz visual, filtros inteligentes y código de colores por niveles de prioridad.

## Features

### 🎯 Similarity Ranges
El sistema clasifica duplicados en 4 rangos de similaridad:

| Range | Percentage | Color | Priority | Description |
|-------|------------|-------|----------|-------------|
| **Critical** | 90-100% | 🔴 Red | Highest | Duplicados casi idénticos - requieren acción inmediata |
| **High** | 70-89% | 🟠 Orange | High | Alta probabilidad de duplicado - revisión urgente |
| **Medium** | 50-69% | 🟡 Yellow | Medium | Posible duplicado - evaluación recomendada |
| **Low** | 0-49% | 🔵 Blue | Low | Baja probabilidad - opcional revisar |

### 📊 Dashboard de Estadísticas

#### Total Overview Card
- **Total de duplicados encontrados** con número destacado
- **Grid de mini-stats** mostrando cantidad por cada rango
- Código de colores visual para identificación rápida
- Íconos diferenciados por nivel de prioridad

#### Filtros por Tabs
Sistema de tabs responsivo con:
- Tab "All" para ver todos los duplicados
- Tabs individuales por rango de similaridad
- Contador de items en cada tab (badges)
- Íconos contextuales por categoría
- Scroll horizontal fluido en móvil

### 🎨 Visual Design

#### Color Coding
```tsx
Critical (90-100%):
  - Border: border-red-500/50
  - Background: bg-red-500/10
  - Text: text-red-600 dark:text-red-400
  - Icon: AlertTriangle

High (70-89%):
  - Border: border-orange-500/50
  - Background: bg-orange-500/10
  - Text: text-orange-600 dark:text-orange-400
  - Icon: AlertCircle

Medium (50-69%):
  - Border: border-yellow-500/50
  - Background: bg-yellow-500/10
  - Text: text-yellow-600 dark:text-yellow-400
  - Icon: Info

Low (0-49%):
  - Border: border-blue-500/50
  - Background: bg-blue-500/10
  - Text: text-blue-600 dark:text-blue-400
  - Icon: GitMerge
```

#### Card Layout
Cada card de duplicado incluye:
- **Header Badge**: Porcentaje de match con badge de prioridad
- **Ícono circular** con código de color del rango
- **Botón Review** para ir a página de merge
- **Grid responsive** de 2 columnas (móvil: 1 columna)
- **Borde lateral izquierdo** con color del rango (4px)
- **Hover effect** con elevación de sombra

### 📱 Responsive Design

#### Mobile (< 768px)
- Tabs con scroll horizontal
- Grid de questions en 1 columna
- Mini-stats en 4 columnas compactas
- Touch-friendly buttons

#### Desktop (≥ 768px)
- Grid de questions en 2 columnas lado a lado
- Tabs visibles sin scroll
- Espaciado optimizado

### 🔍 Algorithm Improvements

#### Stop Words Filtering
Lista de palabras comunes excluidas del análisis:
```js
['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being']
```

#### Similarity Calculation
```js
similarity = (commonWords / max(words1.length, words2.length)) * 100
```

#### Performance
- Límite de 200 preguntas aprobadas por análisis
- Algoritmo O(n²) optimizado con early-return
- Memoización de grupos para evitar recálculos

### 🎯 User Experience

#### Empty States
- **Sin duplicados**: Mensaje positivo de calidad
- **Sin resultados en filtro**: Indicación clara con opción de clear filter
- **Error state**: UI amigable con mensaje de retry

#### Information Display
Cada pregunta muestra:
- ✅ Texto completo con line-clamp (3 líneas)
- 👤 Autor (full_name o display_name)
- 👍 Contador de upvotes
- 💬 Contador de comentarios
- 🏷️ Badge de "Question 1" o "Question 2"

#### Active Filter Feedback
- Contador dinámico de resultados filtrados
- Botón "Clear filter" visible cuando hay filtro activo
- Texto descriptivo del filtro aplicado

## Technical Implementation

### Component Structure
```
app/admin/duplicates/
├── page.tsx (Server Component)
└── components/
    └── duplicates-filter-tabs.tsx (Client Component)
```

### State Management
```tsx
// Active tab state
const [activeTab, setActiveTab] = useState<SimilarityRange | "all">("all")

// Memoized grouping
const groupedDuplicates = useMemo(() => { ... }, [duplicates])

// Memoized filtering
const filteredDuplicates = useMemo(() => { ... }, [activeTab, duplicates, groupedDuplicates])
```

### Type Safety
```tsx
type SimilarityRange = "critical" | "high" | "medium" | "low"

interface SimilarityTab {
  id: SimilarityRange
  label: string
  range: [number, number]
  icon: typeof AlertTriangle
  color: string
  bgColor: string
  borderColor: string
  badgeVariant: "destructive" | "default" | "secondary" | "outline"
}
```

## Usage

### Admin Access
```
URL: /admin/duplicates
Required Role: admin or super_admin
```

### Workflow
1. Admin accede a la página de duplicados
2. Sistema analiza preguntas aprobadas (máx 200)
3. Dashboard muestra estadísticas generales
4. Admin filtra por rango de prioridad usando tabs
5. Admin selecciona duplicado para revisar
6. Sistema redirige a página de merge
7. Admin decide qué pregunta mantener
8. Sistema ejecuta merge (votos, comentarios)

## Performance Metrics

- **Analysis Time**: ~2-5s para 200 preguntas
- **Client-side Filtering**: Instantáneo (memoized)
- **Bundle Size**: ~3KB adicional (componente client)
- **Rendering**: Virtual scrolling no requerido (cantidad limitada)

## Future Enhancements

- [ ] Machine Learning similarity (BERT embeddings)
- [ ] Batch merge actions
- [ ] Export duplicates report (CSV/PDF)
- [ ] Scheduling automatic detection
- [ ] Email notifications for critical duplicates
- [ ] Similarity threshold configuration
- [ ] History of merged questions
- [ ] Undo merge functionality
