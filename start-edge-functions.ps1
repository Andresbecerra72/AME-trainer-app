# Script para iniciar Edge Functions correctamente
Write-Host "Iniciando Edge Functions..." -ForegroundColor Cyan

# Verificar que Supabase esta corriendo
Write-Host "`nVerificando Supabase..." -ForegroundColor Yellow
$status = npx supabase status 2>&1 | Out-String
if ($status -match "is running") {
    Write-Host "Supabase esta corriendo" -ForegroundColor Green
} else {
    Write-Host "ERROR: Supabase NO esta corriendo" -ForegroundColor Red
    Write-Host "Ejecuta: npx supabase start" -ForegroundColor Yellow
    exit 1
}

# Verificar que existe .env.local en functions
$envFile = "supabase\functions\.env.local"
if (Test-Path $envFile) {
    Write-Host "`nArchivo .env.local encontrado" -ForegroundColor Green
    $content = Get-Content $envFile -Raw
    if ($content -match "OPENAI_API_KEY") {
        Write-Host "OPENAI_API_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "ERROR: OPENAI_API_KEY NO encontrado en .env.local" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ERROR: No existe supabase\functions\.env.local" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== INSTRUCCIONES ===" -ForegroundColor Cyan
Write-Host "Abre 2 terminales PowerShell y ejecuta:" -ForegroundColor White
Write-Host "`nTerminal 1:" -ForegroundColor Yellow
Write-Host "cd supabase" -ForegroundColor White
Write-Host "npx supabase functions serve parse-import-job --debug" -ForegroundColor Green
Write-Host "`nTerminal 2:" -ForegroundColor Yellow
Write-Host "cd supabase" -ForegroundColor White
Write-Host "npx supabase functions serve process-import-job-batch --debug" -ForegroundColor Green

Write-Host "`nNOTA: NO usar --env-file, Supabase carga automaticamente:" -ForegroundColor Cyan
Write-Host "  - SUPABASE_URL" -ForegroundColor White
Write-Host "  - SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "  - Variables de .env.local (OPENAI_API_KEY)" -ForegroundColor White

Write-Host "`nPresiona Enter para cerrar..." -ForegroundColor Yellow
Read-Host
