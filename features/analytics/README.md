# Analytics Feature

Módulo de análisis de progreso y rendimiento del usuario.

## Estructura

```
features/analytics/
├── components/              # Componentes UI responsivos
│   ├── OverallStatsCard.tsx
│   ├── StudyTimeChart.tsx
│   ├── TopicPerformanceCard.tsx
│   ├── WeakAreasCard.tsx
│   ├── StrongAreasCard.tsx
│   ├── RecommendationsCard.tsx
│   └── EmptyAnalyticsState.tsx
├── services/               # Lógica de negocio
│   └── analytics.api.ts
└── types.ts               # TypeScript interfaces

```

## Navegación

Acceso desde:
- **Dashboard**: Card "Progress Analytics" con icono TrendingUp
- **URL directa**: `/protected/analytics`

## Componentes

### OverallStatsCard
Muestra estadísticas generales del usuario:
- Reputation (puntos de reputación)
- Questions (preguntas contribuidas)
- Exams Taken (exámenes tomados)
- Avg Score (promedio de puntuación)

**Responsividad**: Grid 2x2, tamaños de texto adaptativos (2xl→3xl en sm+)

### StudyTimeChart
Gráfico de barras horizontal mostrando tiempo de estudio en los últimos 7 días.

**Responsividad**: 
- Etiquetas de día: w-8 sm:w-10
- Altura de barras: h-7 sm:h-8
- Tamaños de texto adaptativos

### TopicPerformanceCard
Lista todos los temas con:
- Barra de progreso por tema
- Porcentaje de rendimiento
- Colores dinámicos (success/warning/danger)

**Responsividad**: line-clamp-1 en títulos largos, texto xs→sm

### WeakAreasCard
Muestra top 3 áreas más débiles con diseño rojo/alerta.

**Responsividad**: line-clamp-2 en títulos, text-sm→base

### StrongAreasCard
Muestra top 3 áreas más fuertes con diseño verde/éxito.

**Responsividad**: Misma estructura que WeakAreasCard

### RecommendationsCard
Lista de recomendaciones personalizadas basadas en el rendimiento.

**Responsividad**: text-xs→sm, bullets con flex-shrink-0

### EmptyAnalyticsState
Estado vacío cuando el usuario no ha tomado exámenes.

**Responsividad**: padding py-6→py-8, botón con tamaños adaptativos

## API

### `getUserAnalytics(userId: string): Promise<AnalyticsData>`

Server action que:
1. Obtiene estadísticas del usuario via `getUserStats()`
2. Obtiene historial de exámenes via `getExamHistory()`
3. Calcula rendimiento por tema
4. Identifica áreas débiles y fuertes (top 3)
5. Calcula tiempo de estudio últimos 7 días
6. Retorna objeto `AnalyticsData` completo

**Lógica clave**:
- Promedio por tema: (correctas / totales) * 100
- Áreas débiles: 3 temas con menor score
- Áreas fuertes: 3 temas con mayor score
- Tiempo de estudio: suma de exam.time_taken por día

## Types

```typescript
interface TopicPerformance {
  id: string
  title: string
  questionsAttempted: number
  averageScore: number
  timeSpent: number
}

interface StudyTimeData {
  day: string
  hours: number
}

interface OverallStats {
  reputation: number
  questionsContributed: number
  totalExams: number
  averageScore: number
}

interface AnalyticsData {
  overallStats: OverallStats
  studyTimeData: StudyTimeData[]
  topicPerformance: TopicPerformance[]
  weakAreas: TopicPerformance[]
  strongAreas: TopicPerformance[]
}
```

## Integración

La página `/protected/analytics/page.tsx`:
1. Obtiene sesión con `getSession()`
2. Llama a `getUserAnalytics(user.id)`
3. Renderiza componentes según datos disponibles
4. Muestra `EmptyAnalyticsState` si no hay exámenes

## Responsividad

Todos los componentes siguen el patrón mobile-first:
- Espaciado: p-4 sm:p-6, space-y-4 sm:space-y-6
- Texto: text-xs sm:text-sm, text-sm sm:text-base
- Grid: Adaptativo con gap-3 sm:gap-4
- Truncamiento: line-clamp-1/2 para textos largos
- Whitespace-nowrap para métricas numéricas

## Mejoras Implementadas

✅ Separación de lógica de negocio (services/analytics.api.ts)
✅ Componentes reutilizables y modulares
✅ Responsividad completa en todos los componentes
✅ TypeScript con interfaces tipadas
✅ Navegación desde dashboard
✅ Session management centralizado (getSession)
✅ Manejo de estado vacío
