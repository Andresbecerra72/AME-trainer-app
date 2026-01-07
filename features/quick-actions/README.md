# Quick Actions Management System

## Overview
Sistema completo de gestión de Quick Actions que permite al Super Admin controlar qué acciones rápidas ve cada rol en el dashboard.

## Arquitectura

### Database Schema
- **quick_actions**: Almacena todas las acciones rápidas disponibles
- **role_quick_actions**: Controla visibilidad y orden por rol

### Feature Structure
```
features/quick-actions/
├── types.ts                                    # TypeScript types
├── services/
│   └── quick-actions.api.ts                   # Server actions
└── components/
    ├── DynamicIcon.tsx                        # Renderiza iconos dinámicamente
    └── RoleQuickActionSettings.tsx            # UI de gestión
```

### Admin Interface
- **Route**: `/admin/settings/quick-actions`
- **Permisos**: Solo super_admin
- **Features**:
  - Tabs por rol (User, Admin, Super Admin)
  - Toggle de visibilidad por acción
  - Contador de acciones visibles
  - Guardado bulk de cambios

## Database Tables

### quick_actions
```sql
- id: UUID
- title: VARCHAR(100)
- description: TEXT
- icon: VARCHAR(50) -- Nombre del icono de lucide-react
- color: VARCHAR(50) -- Clase Tailwind
- bg_color: VARCHAR(100) -- Clase Tailwind
- path: VARCHAR(255)
- display_order: INTEGER
- is_active: BOOLEAN
```

### role_quick_actions
```sql
- id: UUID
- role: VARCHAR(50) -- 'user' | 'admin' | 'super_admin'
- quick_action_id: UUID -- FK to quick_actions
- is_hidden: BOOLEAN
- display_order: INTEGER
```

## API Functions

### Server Actions
- `getQuickActions()` - Obtiene todas las acciones activas
- `getQuickActionsForRole(role)` - Acciones visibles para un rol
- `getRoleQuickActionsConfig(role)` - Configuración completa por rol
- `updateRoleQuickAction(payload)` - Actualiza visibilidad de una acción
- `bulkUpdateRoleQuickActions(role, updates)` - Actualización masiva
- `createQuickAction(action)` - Crea nueva acción (Super Admin)

## Dashboard Integration

El dashboard ahora:
1. Obtiene Quick Actions desde Supabase filtradas por rol
2. Renderiza iconos dinámicamente usando lucide-react
3. Divide en 4 acciones principales (sidebar) y resto (full-width)
4. Respeta orden y visibilidad configurados

## Usage Example

### Admin Configuration
```typescript
// En /admin/settings/quick-actions
// El super admin puede:
// 1. Seleccionar rol (User/Admin/Super Admin)
// 2. Toggle visibilidad de cada acción
// 3. Ver contadores de acciones visibles
// 4. Guardar cambios (afecta inmediatamente)
```

### Dashboard Display
```typescript
// En /protected/dashboard
// El sistema:
// 1. Detecta rol del usuario
// 2. Carga solo acciones visibles para ese rol
// 3. Renderiza en orden configurado
// 4. Aplica estilos y colores específicos
```

## RLS Policies

- **quick_actions**: Todos pueden leer activos, solo super_admin modifica
- **role_quick_actions**: Usuarios leen su config, solo super_admin modifica

## Migration

Ejecutar script: `013_quick_actions_management.sql`
- Crea tablas con indexes
- Seed de 13 Quick Actions por defecto
- Configura RLS policies
- Todas las acciones visibles por defecto

## Responsive Design

### Desktop (lg+)
- Sidebar derecha: 4 Quick Actions principales
- Full-width abajo: Resto de acciones (3-4 columnas)

### Tablet (md)
- 2 columnas para Quick Actions

### Mobile (sm)
- 1 columna, stack vertical

## Security

- ✅ RLS habilitado en ambas tablas
- ✅ Solo super_admin puede modificar configuraciones
- ✅ Usuarios solo ven acciones de su rol
- ✅ Validación de roles en server actions

## Future Enhancements

- [ ] Drag & drop para reordenar acciones
- [ ] Crear nuevas Quick Actions desde UI
- [ ] Analytics de clicks por acción
- [ ] Personalización por usuario individual
- [ ] Scheduled visibility (mostrar acciones por fecha/hora)
