# Quick Actions Management - Setup Instructions

## 🚀 Paso 1: Database Migration

Ejecuta el script SQL en tu base de datos Supabase:

```bash
# Opción 1: Supabase CLI
supabase db reset
supabase db push

# Opción 2: Supabase Dashboard
# 1. Ve a SQL Editor en tu proyecto Supabase
# 2. Copia y pega el contenido de scripts/013_quick_actions_management.sql
# 3. Ejecuta el query
```

**Archivo**: `scripts/013_quick_actions_management.sql`

Esto creará:
- Tabla `quick_actions` con 13 acciones pre-configuradas
- Tabla `role_quick_actions` con configuración por defecto para cada rol
- RLS policies para seguridad
- Indexes para performance

## 🔐 Paso 2: Verificar Permisos

Asegúrate de tener al menos un usuario con role `super_admin`:

```sql
-- Ejecuta en Supabase SQL Editor
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'tu-email@example.com';
```

## 🎨 Paso 3: Acceder a la Configuración

1. Inicia sesión como super_admin
2. Navega a: `/admin/settings`
3. Click en "Quick Actions"
4. Verás 3 tabs: User, Admin, Super Admin

## ⚙️ Paso 4: Configurar Visibilidad

Para cada rol:
1. Selecciona el tab del rol
2. Usa los switches para mostrar/ocultar acciones
3. El contador muestra "X of 13 actions visible"
4. Click en "Save All Changes"

### Ejemplo de Configuración

**Para Role "user":**
- ✅ Study Topics
- ✅ Community
- ✅ Practice Exam
- ✅ My Collections
- ❌ Add Questions (oculto)
- ❌ Progress Analytics (oculto)

**Para Role "admin":**
- ✅ Todas las acciones del user
- ✅ Add Questions
- ✅ Progress Analytics
- ❌ System Settings (solo super_admin)

## 📱 Paso 5: Verificar en Dashboard

1. Cierra sesión y vuelve a iniciar con un usuario normal
2. Ve al Dashboard (`/protected/dashboard`)
3. Verás solo las Quick Actions habilitadas para tu rol
4. Las acciones ocultas no aparecerán

## 🔄 Paso 6: Actualizar Dashboard (Ya implementado)

El dashboard ahora:
- ✅ Carga Quick Actions desde Supabase
- ✅ Filtra por rol automáticamente
- ✅ Renderiza iconos dinámicamente
- ✅ Respeta orden configurado

No necesitas hacer cambios adicionales en el dashboard.

## 🧪 Testing

### Test 1: Visibilidad por Rol
```
1. Login como user → Ver X acciones
2. Login como admin → Ver Y acciones
3. Login como super_admin → Ver Z acciones
```

### Test 2: Cambios en Tiempo Real
```
1. Login como super_admin
2. Ve a /admin/settings/quick-actions
3. Oculta "Daily Question" para role user
4. Guarda cambios
5. Login como user
6. Verifica que "Daily Question" no aparece
```

### Test 3: Responsive
```
1. Desktop: 4 acciones sidebar + grid de resto
2. Tablet: Grid de 2 columnas
3. Mobile: Stack vertical
```

## 📊 Estructura de Archivos Creados

```
scripts/
└── 013_quick_actions_management.sql     # Schema + seed data

features/quick-actions/
├── index.ts                             # Barrel exports
├── types.ts                             # TypeScript types
├── README.md                            # Documentación técnica
├── services/
│   └── quick-actions.api.ts            # Server actions
└── components/
    ├── DynamicIcon.tsx                  # Renderiza iconos
    └── RoleQuickActionSettings.tsx      # UI de administración

app/admin/settings/
├── page.tsx                             # Landing page (actualizado)
└── quick-actions/
    └── page.tsx                         # Gestión de Quick Actions

app/protected/dashboard/
└── page.tsx                             # Dashboard (actualizado)
```

## 🎯 Características Implementadas

- ✅ Schema completo con RLS
- ✅ Server actions con TypeScript types
- ✅ UI responsive con tabs por rol
- ✅ Toggle de visibilidad en tiempo real
- ✅ Guardado bulk de cambios
- ✅ Integración completa en dashboard
- ✅ Iconos dinámicos de lucide-react
- ✅ Ordenamiento customizable
- ✅ Contadores de acciones visibles
- ✅ Feature-based architecture
- ✅ Código limpio y escalable

## 🔧 Configuración Avanzada

### Agregar Nueva Quick Action

Opción 1 - Desde SQL:
```sql
INSERT INTO quick_actions (title, description, icon, color, bg_color, path, display_order)
VALUES (
  'Nueva Acción',
  'Descripción',
  'Star', -- Nombre del icono de lucide-react
  'text-yellow-600',
  'bg-yellow-50 dark:bg-yellow-950/20',
  '/protected/nueva-ruta',
  14
);

-- Agregar a todos los roles
INSERT INTO role_quick_actions (role, quick_action_id, is_hidden, display_order)
SELECT 'user', id, false, 14 FROM quick_actions WHERE title = 'Nueva Acción';
```

Opción 2 - Desde código (futuro):
```typescript
await createQuickAction({
  title: "Nueva Acción",
  description: "Descripción",
  icon: "Star",
  // ... resto de campos
})
```

### Reordenar Acciones

```sql
UPDATE role_quick_actions 
SET display_order = 1 
WHERE role = 'user' AND quick_action_id = 'uuid-de-accion';
```

## ⚠️ Troubleshooting

### Quick Actions no aparecen
1. Verifica que el script SQL se ejecutó correctamente
2. Revisa que el usuario tenga un role válido en profiles
3. Verifica que `is_hidden = false` en role_quick_actions

### Error de permisos
1. Verifica RLS policies en Supabase
2. Confirma que el usuario es super_admin
3. Revisa que las tablas existen

### Iconos no se muestran
1. Verifica que el nombre del icono existe en lucide-react
2. Usa formato PascalCase (ej: "PlusCircle", no "plus-circle")
3. Fallback: Si no encuentra el icono, usa "Circle"

## 📞 Support

Para issues o mejoras, consulta:
- `features/quick-actions/README.md` - Documentación técnica
- `scripts/013_quick_actions_management.sql` - Schema y comentarios
- Server actions en `features/quick-actions/services/quick-actions.api.ts`

## 🎉 ¡Listo!

Tu sistema de Quick Actions Management está completamente configurado y funcionando. Los usuarios ahora verán solo las acciones relevantes para su rol, y el super_admin puede gestionar todo desde la interfaz de administración.
