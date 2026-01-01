# PowerShell script to switch to LOCAL development environment
param(
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[*] Cambiando a entorno LOCAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backup current .env.local if exists
if (Test-Path ".env.local") {
    Copy-Item ".env.local" ".env.local.backup" -Force
    Write-Host "[~] Backup creado: .env.local.backup" -ForegroundColor Yellow
}

# Copy local environment
if (Test-Path ".env.local.development") {
    Copy-Item ".env.local.development" ".env.local" -Force
    Write-Host "[OK] Archivo .env.local actualizado con credenciales LOCALES" -ForegroundColor Green
} else {
    Write-Host "[!] ERROR: .env.local.development no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuracion actual:" -ForegroundColor Yellow
Write-Host "  - Supabase URL: http://127.0.0.1:54321" -ForegroundColor White
Write-Host "  - Studio: http://127.0.0.1:54323" -ForegroundColor White
Write-Host ""

if (-not $NoStart) {
    Write-Host "[*] Iniciando servicios locales..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check Docker
    $dockerRunning = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $dockerRunning) {
        Write-Host "[!] Docker Desktop no esta corriendo. Iniciando..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Write-Host "[~] Esperando a Docker (30 segundos)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }
    
    # Start Supabase
    Write-Host "[+] Iniciando Supabase local..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx supabase start"
    
    Start-Sleep -Seconds 10
    
    # Start Next.js
    Write-Host "[+] Iniciando Next.js..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm dev"
    
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[OK] Entorno LOCAL iniciado!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "App: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "Studio: http://127.0.0.1:54323" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "[i] Usa -NoStart para solo cambiar .env sin iniciar servicios" -ForegroundColor Cyan
    Write-Host "[i] Inicia manualmente con: .\start-dev.ps1" -ForegroundColor Cyan
    Write-Host ""
}
