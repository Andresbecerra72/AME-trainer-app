# Edge Functions - Problema Resuelto ✅

## Problema
Las Edge Functions no estaban iniciando correctamente, causando errores de "Missing environment variables".

## Causa Raíz
El comando `npx supabase functions serve` sin el flag `--env-file` **NO** cargaba automáticamente el archivo `supabase/functions/.env.local`.

## Solución

### Comando Correcto
```powershell
cd C:\Users\JACKA\Desktop\AME_app\ame-app-v1
npx supabase functions serve --env-file supabase/functions/.env.local --debug
```

### Verificación
Cuando las funciones están corriendo correctamente, verás:
```
Serving functions on http://127.0.0.1:54321/functions/v1/<function-name>
 - http://127.0.0.1:54321/functions/v1/parse-import-job
 - http://127.0.0.1:54321/functions/v1/process-import-job-batch
Using supabase-edge-runtime-1.69.28 (compatible with Deno v2.1.4)
```

### Notas Importantes
1. **Avisos sobre SUPABASE_* variables**: Es normal ver estos mensajes:
   ```
   Env name cannot start with SUPABASE_, skipping: SUPABASE_URL
   Env name cannot start with SUPABASE_, skipping: SUPABASE_ANON_KEY
   Env name cannot start with SUPABASE_, skipping: SUPABASE_SERVICE_ROLE_KEY
   ```
   
   Esto es **esperado y correcto**. Las Edge Functions usan las credenciales del sistema local de Supabase automáticamente, no necesitan estas variables explícitamente.

2. **Variables que SÍ se cargan**:
   - `OPENAI_API_KEY` ✅ (esta sí se carga y es necesaria)

## Archivo de Entorno
**Ubicación**: `supabase/functions/.env.local`

```env
# API Keys de terceros
OPENAI_API_KEY=sk-proj-xxx...

# Variables de Supabase (se ignoran pero las dejamos por documentación)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Cómo Probar

1. Asegúrate que Supabase esté corriendo:
   ```powershell
   npx supabase status
   ```

2. Inicia las Edge Functions:
   ```powershell
   npx supabase functions serve --env-file supabase/functions/.env.local --debug
   ```

3. Sube un PDF desde la UI y observa los logs en la terminal

4. Verifica el progreso:
   ```sql
   SELECT id, status, error, total_pages, completed_pages, created_at 
   FROM question_imports 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

## Logs a Monitorear

### Logs Esperados (Éxito)
```
2026-01-26T14:49:40.775501216Z Serving functions on http://127.0.0.1:54321/functions/v1/<function-name>
```

### Logs de Error Anteriores (Resueltos)
- ❌ "Missing environment variables" → Resuelto con `--env-file`
- ❌ "Bucket not found" → Resuelto creando bucket question-imports
- ❌ "mime type text/plain;charset=UTF-8 is not supported" → Resuelto agregando contentType

## Scripts PowerShell

Puedes crear un script para iniciar todo:

**`start-edge-functions.ps1`**:
```powershell
#!/usr/bin/env pwsh
# Inicia las Edge Functions locales con variables de entorno

Write-Host "🚀 Iniciando Supabase Edge Functions..." -ForegroundColor Green

# Verificar que Supabase esté corriendo
$status = npx supabase status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Supabase no está corriendo. Iniciando..." -ForegroundColor Yellow
    npx supabase start
}

# Iniciar Edge Functions
Write-Host "📦 Cargando variables de entorno desde supabase/functions/.env.local" -ForegroundColor Cyan
npx supabase functions serve --env-file supabase/functions/.env.local --debug
```

Uso:
```powershell
.\start-edge-functions.ps1
```

## Estado Actual
✅ Edge Functions iniciando correctamente  
✅ Variables de entorno cargadas  
✅ Bucket de storage creado  
✅ Listo para procesar PDFs de 20+ páginas  

---
**Última actualización**: 2026-01-26
