# PowerShell script to start development environment
Write-Host "[*] Iniciando entorno de desarrollo AME App..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerRunning) {
    Write-Host "[!] Docker Desktop no esta corriendo. Iniciando..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "[~] Esperando a que Docker inicie (30 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "[+] Iniciando Supabase..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx supabase start"

Write-Host "[~] Esperando a que Supabase inicie (10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[+] Iniciando Next.js..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] Servicios iniciados correctamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Supabase Studio:" -ForegroundColor Yellow
Write-Host "   http://127.0.0.1:54323" -ForegroundColor White
Write-Host ""
Write-Host "Next.js App:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Inbucket (emails de prueba):" -ForegroundColor Yellow
Write-Host "   http://127.0.0.1:54324" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[i] Para detener: ejecuta 'npx supabase stop'" -ForegroundColor Cyan
Write-Host "[i] Ver guia completa: EDGE_FUNCTION_SETUP.md" -ForegroundColor Cyan
Write-Host ""
