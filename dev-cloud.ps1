# PowerShell script to switch to CLOUD environment
param(
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[*] Cambiando a entorno CLOUD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backup current .env.local if exists
if (Test-Path ".env.local") {
    Copy-Item ".env.local" ".env.local.backup" -Force
    Write-Host "[~] Backup creado: .env.local.backup" -ForegroundColor Yellow
}

# Copy cloud environment
if (Test-Path ".env.local.cloud") {
    Copy-Item ".env.local.cloud" ".env.local" -Force
    Write-Host "[OK] Archivo .env.local actualizado con credenciales CLOUD" -ForegroundColor Green
} else {
    Write-Host "[!] ERROR: .env.local.cloud no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuracion actual:" -ForegroundColor Yellow
Write-Host "  - Supabase URL: https://naznqbddcvnyosmaznax.supabase.co" -ForegroundColor White
Write-Host "  - Studio: https://supabase.com/dashboard/project/naznqbddcvnyosmaznax" -ForegroundColor White
Write-Host ""

# Stop local Supabase if running
Write-Host "[~] Deteniendo Supabase local (si esta corriendo)..." -ForegroundColor Yellow
npx supabase stop 2>$null | Out-Null

if (-not $NoStart) {
    Write-Host ""
    Write-Host "[+] Iniciando Next.js con Supabase CLOUD..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm dev"
    
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[OK] Entorno CLOUD iniciado!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "App: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "Studio: https://supabase.com/dashboard" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[!] ATENCION: Estas conectado a la base de datos REMOTA" -ForegroundColor Red
    Write-Host "[!] Todos los cambios afectaran datos en CLOUD" -ForegroundColor Red
    Write-Host ""
} else {
    Write-Host "[i] Entorno cambiado a CLOUD (sin iniciar servicios)" -ForegroundColor Cyan
    Write-Host "[i] Inicia manualmente con: pnpm dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[!] ATENCION: Estas conectado a la base de datos REMOTA" -ForegroundColor Red
    Write-Host ""
}
