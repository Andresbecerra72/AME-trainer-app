# PowerShell script to stop development environment
Write-Host "[*] Deteniendo servicios AME App..." -ForegroundColor Yellow
Write-Host ""

Write-Host "[~] Deteniendo Supabase..." -ForegroundColor Cyan
npx supabase stop

Write-Host ""
Write-Host "[OK] Servicios detenidos correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "[i] Tip: Para iniciar de nuevo, ejecuta .\start-dev.ps1" -ForegroundColor Cyan
