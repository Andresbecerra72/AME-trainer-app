# ✅ APK Generation - PWA Builder Method (RECOMMENDED)

## 🎯 Solución de Advertencias de PWABuilder

Antes de generar tu APK, asegúrate de que tu PWA cumpla con todos los requisitos de PWABuilder. Este documento primero resuelve las advertencias comunes y luego explica cómo generar el APK.

### ✅ Advertencias Resueltas

#### 1. Service Worker ✓
Tu PWA ya tiene un Service Worker en `public/sw.js` que maneja caching y funcionalidad offline.

#### 2. Screenshots 404 - **RESUELTO**
**Problema:** Las imágenes en `/screenshots/dashboard.png` y `/screenshots/practice.png` devolvían 404.

**Solución aplicada:**
- ✅ Creada carpeta `public/screenshots/`
- ✅ Generados screenshots placeholder PNG (1080x1920):
  - `dashboard.png` - Muestra dashboard con estadísticas de estudio
  - `practice.png` - Muestra modo de práctica con pregunta de ejemplo
- ✅ Archivos accesibles en: `https://v0-ame-exam-trainer-app.vercel.app/screenshots/`

> **IMPORTANTE:** Estos son placeholders básicos. Para screenshots profesionales de tu app real, consulta [SCREENSHOTS_GUIDE.md](./SCREENSHOTS_GUIDE.md).

#### 3. Manifest ID - **RESUELTO**
**Problema:** Faltaba el campo `id` en el manifest, lo que puede causar que el navegador identifique incorrectamente la app si cambia el `start_url`.

**Solución aplicada:**
```json
{
  "id": "/",
  "name": "AME Exam Trainer - Aircraft Maintenance Engineer Study App",
  ...
}
```

El campo `id` proporciona un identificador estable que no cambiará aunque modifiques el `start_url` en el futuro.

### 📋 Checklist Pre-APK

Antes de proceder con la generación del APK, verifica:

- [x] Service Worker presente y funcional
- [x] Screenshots PNG accesibles (1080x1920)
- [x] Campo `id` en manifest.json
- [x] App desplegada y accesible en web
- [ ] Screenshots reemplazados con capturas reales (opcional pero recomendado)

---

## Why Switch to PWA Builder?

Bubblewrap tiene un bug conocido en macOS donde no puede encontrar el archivo `release` en Java 11, a pesar de que existe. PWA Builder resuelve este problema completamente y es:

- ✅ Browser-based (sin instalaciones locales)
- ✅ No requiere Java o Android SDK
- ✅ Genera APK listo para firmar
- ✅ Mantenido por Google directamente
- ✅ Más confiable que Bubblewrap

---

## 🚀 Pasos para Generar APK con PWA Builder

### Paso 0: Verificar Requisitos PWA
Antes de empezar, ejecuta el análisis en PWABuilder:
```
https://www.pwabuilder.com/
```
Ingresa tu URL y confirma que **NO hay advertencias críticas**.

### Paso 1: Ir a PWA Builder
```
https://www.pwabuilder.com/
```

###  Paso 2: Ingresar URL de tu PWA
```
https://v0-ame-exam-trainer-app.vercel.app
```

### Paso 3: Click en "Start"
PWA Builder analizará tu PWA y mostrará un reporte

### Paso 4: Generar Android APK
1. En la sección "Android", click en **"Generate"**
2. Se abrirá un diálogo con opciones:
   - Package name: `com.ameexamtrainer.app`
   - App name: `AME Exam Trainer`
   - Launcher name: `AME Trainer`
   - Theme color: `#003A63`
   - Background color: `#003A63`
   - **Signing key:** Puedes usar el keystore generado automáticamente o subir el tuyo
3. Click **"Generate"**
4. Se descargará un archivo `.zip` con:
   - ✅ `AME Exam Trainer.apk` - APK listo para instalar directamente
   - ✅ `AME Exam Trainer.aab` - Android App Bundle para Google Play Store
   - ✅ `signing.keystore` - Keystore usado para firmar
   - ✅ `signing-key-info.txt` - Información del keystore (¡GUÁRDALA!)

**IMPORTANTE:** PWABuilder ahora genera el APK y AAB **ya firmados y listos para usar**. No necesitas Gradle, jarsigner ni zipalign.

### Paso 5: Descomprimir y Verificar

**En Windows (PowerShell):**
```powershell
# Descomprimir el archivo descargado
Expand-Archive -Path "$env:USERPROFILE\Downloads\pwabuilder-android.zip" -DestinationPath "$env:USERPROFILE\Desktop\ame-apk"
cd "$env:USERPROFILE\Desktop\ame-apk"

# Ver archivos generados
Get-ChildItem
```

**Deberías ver:**
- `AME Exam Trainer.apk` ← **APK listo para instalar**
- `AME Exam Trainer.aab` ← **Para Google Play**
- `signing.keystore` ← **GUÁRDALO para futuras actualizaciones**
- `signing-key-info.txt` ← **GUÁRDALO - contiene las contraseñas**

### Paso 6: ¡Tu APK está listo!

**Para instalar en dispositivo Android:**
```powershell
# Opcional: Copiar APK a tu proyecto
Copy-Item "AME Exam Trainer.apk" -Destination "$env:USERPROFILE\Desktop\AME_app\ame-app-v1\ame-trainer-release.apk"
```

Luego:
1. Copia el archivo APK a tu dispositivo Android
2. Abre el archivo en tu teléfono
3. Android te pedirá permiso para "Instalar desde fuentes desconocidas"
4. ¡Instala y prueba tu app!

### Paso 7: Para Google Play Store (usa el AAB)

Para publicar en Google Play Console:
```powershell
# Copiar el AAB (no el APK)
Copy-Item "AME Exam Trainer.aab" -Destination "$env:USERPROFILE\Desktop\AME_app\ame-app-v1\ame-trainer-release.aab"
```

---

##  ✅ Checklist

- [x] ~~Descargaste archivo de PWA Builder~~
- [x] ~~APK generado automáticamente por PWABuilder~~
- [x] ~~AAB generado automáticamente por PWABuilder~~
- [ ] Guardaste `signing.keystore` en lugar seguro
- [ ] Guardaste `signing-key-info.txt` (contraseñas)
- [ ] Probaste el APK en dispositivo Android
- [ ] Listo para subir AAB a Google Play Console

---

## 📱 Próximo: Subir a Google Play Console

Una vez que tengas `app-release-signed.apk`:
tu `AME Exam Trainer.aab`:

1. Ve a [Google Play Console](https://play.google.com/console)
2. Create → New App → "AME Exam Trainer"
3. Fill app details (nombre, categoría, etc.)
4. **Production** → Create new release
5. Upload el archivo `.aab` (NO el `.apk`)
6. Review y submit

**IMPORTANTE:** Google Play requiere el formato `.aab` (Android App Bundle), no acepta `.apk` para nuevas apps.
---

## 🆘 Si aún tienes problemas

**Error "java: command not found"?**
```zsh
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-11.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

**Error en Gradle?**
```zsh
cd ~/Desktop/ame-apk
./gradlew clean
./gradlew assembleRelease
```

**Error en zipalign?**
```zsh
# Buscar versión de Build Tools
ls ~/Library/Android/sdk/build-tools/
# Usar la más reciente, ej: 34.0.0
```

---

**Tu PWA está en vivo en:** https://v0-ame-exam-trainer-app.vercel.app ✅
Troubleshooting

**El APK no instala en mi teléfono?**
```
1. Abre Configuración → Seguridad
2. Activa "Fuentes desconocidas" o "Instalar apps desconocidas"
3. Intenta instalar nuevamente
```

**¿Cómo actualizo la app en el futuro?**
```
1. Guarda el archivo `signing.keystore` y `signing-key-info.txt`
2. Cuando generes una nueva versión en PWABuilder
3. Sube el MISMO keystore para firmar
4. Esto permite que Android reconozca la nueva versión como actualización
```

**¿Necesito el archivo .apk o .aab?**
```
- .apk → Para instalar directamente en dispositivos (testing, distribución directa)
- .aab → Para subir a Google Play Store (OBLIGATORIO para publicación)