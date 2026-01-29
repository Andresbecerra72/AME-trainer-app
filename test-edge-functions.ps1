# Script de prueba para Edge Functions
Write-Host "Verificando estado de Edge Functions..." -ForegroundColor Cyan

# 1. Verificar Supabase esta corriendo
Write-Host "`nEstado de Supabase:" -ForegroundColor Yellow
npx supabase status

# 2. Abrir Supabase Studio
Write-Host "`nAbriendo Supabase Studio..." -ForegroundColor Yellow
Start-Process "http://127.0.0.1:54323/project/default/editor"

Write-Host "`nEjecuta esta query en el SQL Editor:" -ForegroundColor Green
$query = @"
SELECT 
  id, 
  status, 
  file_name,
  next_page, 
  total_pages, 
  completed_pages,
  jsonb_array_length(result) as questions_count,
  locked_at IS NOT NULL as is_locked,
  LENGTH(raw_text) as text_length,
  error,
  updated_at
FROM question_imports 
ORDER BY created_at DESC 
LIMIT 5;
"@
Write-Host $query -ForegroundColor Cyan

Write-Host "`n[IMPORTANTE] Las Edge Functions deben estar corriendo:" -ForegroundColor Yellow
Write-Host "Terminal 1: cd supabase" -ForegroundColor White
Write-Host "Terminal 1: npx supabase functions serve parse-import-job --debug --env-file .env.local" -ForegroundColor Green
Write-Host "`nTerminal 2: cd supabase" -ForegroundColor White
Write-Host "Terminal 2: npx supabase functions serve process-import-job-batch --debug --env-file .env.local" -ForegroundColor Green

Write-Host "`nPresiona Enter para continuar..." -ForegroundColor Yellow
Read-Host
