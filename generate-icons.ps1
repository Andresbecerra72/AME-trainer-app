# PWA Icon Generator Script
# Este script genera los iconos necesarios para la PWA

Write-Host "================================"
Write-Host "  PWA Icon Generator"
Write-Host "================================"
Write-Host ""

# Verificar si existe un icono base
$baseIcon = "public/icon.svg"
$lightIcon = "public/icon-light-32x32.png"
$darkIcon = "public/icon-dark-32x32.png"

if (Test-Path $baseIcon) {
    Write-Host "Found base icon: $baseIcon" -ForegroundColor Green
} elseif (Test-Path $lightIcon) {
    Write-Host "Found light icon: $lightIcon" -ForegroundColor Green
    $baseIcon = $lightIcon
} else {
    Write-Host "No base icon found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure you have one of these files:"
    Write-Host "  - public/icon.svg"
    Write-Host "  - public/icon-light-32x32.png"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Required PWA Icons:"
Write-Host "  [ ] icon-192x192.png  (Android, Chrome)"
Write-Host "  [ ] icon-512x512.png  (Android, Chrome, Splash)"
Write-Host "  [ ] apple-icon.png    (iOS Safari - 180x180)"
Write-Host ""

# Verificar iconos existentes
$icon192 = "public/icon-192x192.png"
$icon512 = "public/icon-512x512.png"
$iconApple = "public/apple-icon.png"

$allExist = $true

if (Test-Path $icon192) {
    Write-Host "  [OK] 192x192 - $icon192" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] 192x192 - $icon192" -ForegroundColor Red
    $allExist = $false
}

if (Test-Path $icon512) {
    Write-Host "  [OK] 512x512 - $icon512" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] 512x512 - $icon512" -ForegroundColor Red
    $allExist = $false
}

if (Test-Path $iconApple) {
    Write-Host "  [OK] 180x180 - $iconApple" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] 180x180 - $iconApple" -ForegroundColor Red
    $allExist = $false
}

Write-Host ""

if ($allExist) {
    Write-Host "All required icons are present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your PWA is ready for icon deployment!"
} else {
    Write-Host "ACTION REQUIRED: Generate Missing Icons" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Use Online Tools (Recommended)"
    Write-Host "  1. Go to https://realfavicongenerator.net/"
    Write-Host "  2. Upload your base icon"
    Write-Host "  3. Configure PWA settings:"
    Write-Host "     - Theme color: #003A63"
    Write-Host "  4. Download and extract to public/ folder"
    Write-Host ""
    Write-Host "Option 2: Use ImageMagick (Command Line)"
    Write-Host "  Install: winget install ImageMagick.ImageMagick"
    Write-Host "  Then run:"
    Write-Host ""
    Write-Host "  magick $baseIcon -resize 192x192 public/icon-192x192.png"
    Write-Host "  magick $baseIcon -resize 512x512 public/icon-512x512.png"
    Write-Host "  magick $baseIcon -resize 180x180 public/apple-icon.png"
    Write-Host ""
}

Write-Host "================================"
Write-Host "  Next Steps:"
Write-Host "================================"
Write-Host ""
Write-Host "1. Generate missing icons using one of the methods above"
Write-Host "2. Run 'pnpm dev' to test PWA locally"
Write-Host "3. Open Chrome DevTools > Application > Manifest"
Write-Host "4. Verify all icons are loading correctly"
Write-Host "5. Test 'Add to Home Screen' functionality"
Write-Host ""
