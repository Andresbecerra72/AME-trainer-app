# 📦 Scripts de inicio rápido

## Windows PowerShell

### Iniciar todo el entorno de desarrollo
```powershell
# start-dev.ps1
Write-Host "🚀 Iniciando entorno de desarrollo AME App..." -ForegroundColor Cyan

# Terminal 1: Supabase
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🗄️ Iniciando Supabase...' -ForegroundColor Green; npx supabase start"

# Esperar 5 segundos para que Supabase inicie
Start-Sleep -Seconds 5

# Terminal 2: Next.js
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '⚛️ Iniciando Next.js...' -ForegroundColor Blue; pnpm dev"

Write-Host ""
Write-Host "✅ Servicios iniciados:" -ForegroundColor Green
Write-Host "   📊 Supabase Studio: http://127.0.0.1:54323" -ForegroundColor Yellow
Write-Host "   🌐 Next.js App: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏹️ Para detener: ejecuta 'npx supabase stop' en la terminal de Supabase" -ForegroundColor Cyan
```

Guarda el script anterior como `start-dev.ps1` y ejecútalo:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

### Detener todos los servicios
```powershell
# stop-dev.ps1
Write-Host "⏹️ Deteniendo servicios..." -ForegroundColor Yellow
npx supabase stop
Write-Host "✅ Supabase detenido" -ForegroundColor Green
```

## Comandos individuales

### Iniciar Supabase
```powershell
npx supabase start
```

### Detener Supabase
```powershell
npx supabase stop
```

### Resetear base de datos (aplica migraciones)
```powershell
npx supabase db reset
```

### Ver logs de Edge Functions
```powershell
npx supabase functions serve --debug
```

### Iniciar Next.js
```powershell
pnpm dev
```

### Verificar estado de Supabase
```powershell
npx supabase status
```

## 🎯 Inicio rápido (paso a paso)

```powershell
# 1. Navegar al proyecto
cd c:\Users\JACKA\Desktop\AME_app\ame-app-v1

# 2. Instalar dependencias (solo primera vez)
pnpm install

# 3. Iniciar Supabase
npx supabase start

# 4. En otra terminal, iniciar Next.js
pnpm dev

# 5. Abrir en el navegador
start http://localhost:3000
```

## 🔧 Troubleshooting

### Error: Docker no está corriendo
```powershell
# Iniciar Docker Desktop manualmente
# O desde PowerShell:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Error: Puerto 54321 ocupado
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :54321

# Detener Supabase y reiniciar
npx supabase stop
npx supabase start
```

### Limpiar completamente Supabase local
```powershell
npx supabase stop --no-backup
Remove-Item -Recurse -Force .\.supabase
npx supabase start
npx supabase db reset
```
