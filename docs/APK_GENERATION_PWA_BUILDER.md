# ✅ APK Generation - PWA Builder Method (RECOMMENDED)

## Why Switch to PWA Builder?

Bubblewrap tiene un bug conocido en macOS donde no puede encontrar el archivo `release` en Java 11, a pesar de que existe. PWA Builder resuelve este problema completamente y es:

- ✅ Browser-based (sin instalaciones locales)
- ✅ No requiere Java o Android SDK
- ✅ Genera APK listo para firmar
- ✅ Mantenido por Google directamente
- ✅ Más confiable que Bubblewrap

---

## 🚀 Pasos para Generar APK con PWA Builder

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
3. Click **"Generate"**
4. Se descargará un archivo `.zip` con el proyecto Android

### Paso 5: Descomprimir y Preparar
```zsh
# Descomprimir el archivo descargado
unzip ~/Downloads/pwabuilder-android.zip -d ~/Desktop/ame-apk
cd ~/Desktop/ame-apk
```

### Paso 6: Generar Keystore para Firma
```zsh
keytool -genkey -v -keystore ame-trainer.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias ame-trainer
```

**Cuando pida información:**
```
Keystore password: [Tu Password Seguro]
First and last name: AME Exam Trainer
Organizational unit: Development  
Organization: AME Exam Trainer
City/Locality: [Tu Ciudad]
State/Province: [Tu Estado]
Country code: MX
```

**GUARDAR ESTA INFORMACIÓN - LA NECESITARÁS PARA ACTUALIZAR LA APP DESPUÉS**

### Paso 7: Firmar el APK
```zsh
# Entrar a la carpeta del proyecto
cd ~/Desktop/ame-apk

# Build APK con Gradle (requiere Java)
./gradlew assembleRelease

# Firma del APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore ame-trainer.keystore \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  ame-trainer

# Alinear el APK (optimización)
# Copiar path a zipalign primero:
~/Library/Android/sdk/build-tools/[VERSION]/zipalign -v 4 \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  app-release-signed.apk
```

### Paso 8: Verificar Firma
```zsh
jarsigner -verify -verbose -certs app-release-signed.apk
```

Deberías ver: ✅ **jar verified.**

### Paso 9: Copiar a carpeta de deployment
```zsh
cp app-release-signed.apk ~/Desktop/AME\ Trainer/ame-app-v1/app-release-signed.apk
```

---

##  ✅ Checklist

- [ ] Descargaste archivo de PWA Builder
- [ ] Generaste keystore con `keytool`
- [ ] Ejecutaste `./gradlew assembleRelease`
- [ ] Firmaste el APK con `jarsigner`
- [ ] Alineaste con `zipalign`
- [ ] Verificaste firma con `jarsigner -verify`
- [ ] Tienes `app-release-signed.apk` listo
- [ ] Keystore guardado en lugar seguro

---

## 📱 Próximo: Subir a Google Play Console

Una vez que tengas `app-release-signed.apk`:

1. Ve a Google Play Console
2. Create → New App → AME Exam Trainer
3. Internal testing → Create release
4. Upload APK
5. Review y submit

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
