# Script para Deploy a Vercel y generar TWA
# AME Exam Trainer - Deployment Script

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║       AME EXAM TRAINER - DEPLOYMENT WIZARD            ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================
# PASO 1: Verificar Instalaciones
# ============================================
Write-Host "PASO 1: Verificando herramientas instaladas..." -ForegroundColor Yellow
Write-Host ""

# Verificar Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Node.js no instalado" -ForegroundColor Red
    Write-Host "  Instalar desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] npm no instalado" -ForegroundColor Red
    exit 1
}

# Verificar Vercel CLI
$vercelVersion = vercel --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Vercel CLI: $vercelVersion" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Vercel CLI no instalado" -ForegroundColor Yellow
    Write-Host "  Instalando Vercel CLI..." -ForegroundColor White
    npm install -g vercel
}

Write-Host ""

# ============================================
# PASO 2: Build Local Test
# ============================================
Write-Host "PASO 2: Build local de prueba..." -ForegroundColor Yellow
Write-Host ""

$buildTest = Read-Host "Hacer build local de prueba? (s/n)"
if ($buildTest -eq "s") {
    Write-Host "  Ejecutando npm run build..." -ForegroundColor White
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Build exitoso!" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Build fallido. Corrige los errores antes de continuar." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Saltando build local..." -ForegroundColor Gray
}

Write-Host ""

# ============================================
# PASO 3: Deploy a Vercel
# ============================================
Write-Host "PASO 3: Deploy a Vercel..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Opciones de deploy:" -ForegroundColor White
Write-Host "  1. Deploy preview (desarrollo)" -ForegroundColor Gray
Write-Host "  2. Deploy production" -ForegroundColor Gray
Write-Host "  3. Saltar deploy" -ForegroundColor Gray
Write-Host ""

$deployOption = Read-Host "Selecciona opcion (1-3)"

switch ($deployOption) {
    "1" {
        Write-Host "  Deploying preview..." -ForegroundColor White
        vercel
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n  [OK] Preview deploy exitoso!" -ForegroundColor Green
            Write-Host "  Verifica tu app en la URL proporcionada" -ForegroundColor Cyan
        }
    }
    "2" {
        Write-Host "  Deploying production..." -ForegroundColor White
        vercel --prod
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n  [OK] Production deploy exitoso!" -ForegroundColor Green
            Write-Host "  Tu app esta en vivo!" -ForegroundColor Cyan
        }
    }
    "3" {
        Write-Host "  Saltando deploy a Vercel..." -ForegroundColor Gray
    }
    default {
        Write-Host "  Opcion invalida. Saltando deploy..." -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# PASO 4: Configurar TWA
# ============================================
Write-Host "PASO 4: Configuracion TWA (Trusted Web Activity)..." -ForegroundColor Yellow
Write-Host ""

$configureTWA = Read-Host "Configurar TWA para Android? (s/n)"

if ($configureTWA -eq "s") {
    # Verificar @bubblewrap/cli
    Write-Host "  Verificando Bubblewrap CLI..." -ForegroundColor White
    
    $bubblewrapVersion = bubblewrap --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [INFO] Instalando Bubblewrap CLI..." -ForegroundColor Cyan
        npm install -g @bubblewrap/cli
    } else {
        Write-Host "  [OK] Bubblewrap CLI instalado" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "  Para generar el APK necesitaras:" -ForegroundColor Yellow
    Write-Host "    1. URL de produccion de tu app (de Vercel)" -ForegroundColor White
    Write-Host "    2. Android SDK instalado" -ForegroundColor White
    Write-Host "    3. Java JDK 11+" -ForegroundColor White
    Write-Host ""
    
    $continueAPK = Read-Host "Continuar con generacion de APK? (s/n)"
    
    if ($continueAPK -eq "s") {
        Write-Host ""
        Write-Host "  Ingresa la informacion de tu app:" -ForegroundColor Cyan
        Write-Host ""
        
        $appUrl = Read-Host "  URL de produccion (ej: https://ame-trainer.vercel.app)"
        if (-not $appUrl) {
            $appUrl = "https://ame-exam-trainer.vercel.app"
        }
        
        Write-Host ""
        Write-Host "  Generando configuracion TWA..." -ForegroundColor White
        Write-Host "  Ejecuta este comando manualmente:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  bubblewrap init --manifest $appUrl/manifest.json" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Luego sigue estos pasos:" -ForegroundColor Yellow
        Write-Host "    1. Package name: com.ameexamtrainer.app" -ForegroundColor Gray
        Write-Host "    2. App name: AME Exam Trainer" -ForegroundColor Gray
        Write-Host "    3. Display mode: standalone" -ForegroundColor Gray
        Write-Host "    4. Orientation: portrait" -ForegroundColor Gray
        Write-Host "    5. Theme color: #003A63" -ForegroundColor Gray
        Write-Host "    6. Background color: #003A63" -ForegroundColor Gray
        Write-Host "    7. Start URL: $appUrl" -ForegroundColor Gray
        Write-Host "    8. Icon: Usar iconos generados" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  Despues ejecuta:" -ForegroundColor Yellow
        Write-Host "    bubblewrap build" -ForegroundColor Cyan
        Write-Host ""
        
        # Guardar URL para referencia
        $appUrl | Out-File -FilePath "deployment-url.txt" -Encoding UTF8
        Write-Host "  [INFO] URL guardada en deployment-url.txt" -ForegroundColor Cyan
    }
} else {
    Write-Host "  Saltando configuracion TWA..." -ForegroundColor Gray
}

Write-Host ""

# ============================================
# PASO 5: Resumen y Siguientes Pasos
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Siguientes pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verificar deployment en Vercel:" -ForegroundColor White
Write-Host "   - Abrir Vercel Dashboard" -ForegroundColor Gray
Write-Host "   - Verificar que todos los checks pasen" -ForegroundColor Gray
Write-Host "   - Probar PWA en produccion" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Generar APK con Bubblewrap:" -ForegroundColor White
Write-Host "   - Seguir instrucciones arriba" -ForegroundColor Gray
Write-Host "   - Firmar APK con keystore" -ForegroundColor Gray
Write-Host "   - Probar en dispositivo Android" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Preparar para Play Store:" -ForegroundColor White
Write-Host "   - Capturar screenshots" -ForegroundColor Gray
Write-Host "   - Crear feature graphic" -ForegroundColor Gray
Write-Host "   - Escribir descripcion" -ForegroundColor Gray
Write-Host "   - Completar content rating" -ForegroundColor Gray
Write-Host ""

Write-Host "Ver guia completa en: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
