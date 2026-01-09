# 🚀 Guía Completa de Deployment - AME Exam Trainer

Esta guía te llevará paso a paso desde el deployment en Vercel hasta la publicación en Google Play Store.

---

## 📋 Requisitos Previos

### Herramientas Necesarias
- ✅ Node.js 18+ y npm
- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Android Studio (para generar APK)
- ✅ Java JDK 11+
- ✅ Cuenta de [Google Play Developer](https://play.google.com/console) ($25 USD una vez)

### Verificar Instalaciones
```powershell
node --version    # v18.0.0 o superior
npm --version     # 9.0.0 o superior
java --version    # 11.0.0 o superior
```

---

## 🌐 FASE 1: Deploy a Vercel

### Paso 1.1: Instalar Vercel CLI
```powershell
npm install -g vercel
```

### Paso 1.2: Login en Vercel
```powershell
vercel login
```
Esto abrirá tu navegador para autenticarse.

### Paso 1.3: Configurar Variables de Entorno en Vercel

**IMPORTANTE:** Antes de deploy, configura tus variables en Vercel Dashboard:

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Settings** → **Environment Variables**
4. Agrega todas estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

✅ **Marca todas para Production, Preview y Development**

### Paso 1.4: Deploy Preview (Opcional)
Para probar antes de producción:
```powershell
vercel
```
Esto genera una URL de preview como: `https://ame-trainer-xyz123.vercel.app`

### Paso 1.5: Deploy a Production
```powershell
vercel --prod
```

**Resultado esperado:**
```
✓ Production: https://ame-exam-trainer.vercel.app [42s]
📝 Deployed to production. Run vercel --prod to overwrite later deployments.
```

### Paso 1.6: Verificar Deployment

1. **Abrir URL de producción** en navegador
2. **Verificar funcionalidades:**
   - ✅ Login/Register funcionan
   - ✅ Supabase conecta correctamente
   - ✅ Service Worker se registra
   - ✅ Manifest.json accesible en `/manifest.json`
   - ✅ Iconos cargan correctamente

3. **Prueba PWA:**
   - En Chrome: Menu → "Install AME Exam Trainer"
   - En mobile: "Add to Home Screen"
   - Desconecta red → debe funcionar offline

4. **Lighthouse Audit:**
   - Abre Chrome DevTools → Lighthouse
   - Run audit para PWA
   - **Objetivo:** Score 90+ en PWA

---

## 📱 FASE 2: Generar APK con TWA (Trusted Web Activity)

### Paso 2.1: Instalar Bubblewrap CLI
```powershell
npm install -g @bubblewrap/cli
```

### Paso 2.2: Verificar Android SDK

**Opción A: Con Android Studio**
1. Instala [Android Studio](https://developer.android.com/studio)
2. Abre SDK Manager
3. Instala:
   - Android SDK Platform 33 (Android 13)
   - Android SDK Build-Tools 33.0.0
   - Android SDK Command-line Tools

**Configurar variables de entorno:**
```powershell
# En PowerShell (como Admin)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\TU_USUARIO\AppData\Local\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

**Reinicia PowerShell y verifica:**
```powershell
$env:ANDROID_HOME
$env:JAVA_HOME
```

### Paso 2.3: Inicializar Proyecto TWA

```powershell
# Crear carpeta para TWA
mkdir twa-project
cd twa-project

# Inicializar con Bubblewrap
bubblewrap init --manifest https://ame-exam-trainer.vercel.app/manifest.json
```

**Responde el wizard:**
```
Package name: com.ameexamtrainer.app
App name: AME Exam Trainer
Launcher name: AME Trainer
Display mode: standalone
Orientation: portrait
Status bar color: #003A63
Navigation bar color: #003A63
Theme color: #003A63
Background color: #003A63
Start URL: https://ame-exam-trainer.vercel.app
Icon URL: https://ame-exam-trainer.vercel.app/icon-512x512.png
Maskable icon URL: https://ame-exam-trainer.vercel.app/icon-512x512.png
Shortcuts: Yes
```

Esto crea `twa-manifest.json` con la configuración.

### Paso 2.4: Generar Keystore para Firma

**IMPORTANTE:** Guarda bien estos archivos, los necesitarás para actualizar la app.

```powershell
keytool -genkey -v -keystore ame-trainer.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias ame-trainer
```

**Responde:**
```
Keystore password: [CREAR_PASSWORD_SEGURO]
Re-enter password: [MISMO_PASSWORD]
First and last name: Tu Nombre o Empresa
Organizational unit: Development
Organization: AME Exam Trainer
City: Tu Ciudad
State: Tu Estado/Provincia
Country code: MX (o tu código de país)
```

**Guarda esta información en un lugar seguro:**
```
Keystore file: ame-trainer.keystore
Keystore password: [TU_PASSWORD]
Key alias: ame-trainer
Key password: [MISMO_PASSWORD]
```

### Paso 2.5: Build del APK

```powershell
# Build signed APK
bubblewrap build
```

**Cuando pida keystore info:**
```
Key store file: ame-trainer.keystore
Key store password: [TU_PASSWORD]
Key alias: ame-trainer
Key password: [TU_PASSWORD]
```

**Resultado esperado:**
```
✓ Building Android APK...
✓ APK generated: ./app-release-signed.apk
```

### Paso 2.6: Probar APK Localmente

**Opción A: Con dispositivo físico**
1. Habilita "Developer Options" en Android
2. Activa "USB Debugging"
3. Conecta dispositivo
4. Instala APK:
```powershell
adb install app-release-signed.apk
```

**Opción B: Con emulador**
1. Abre Android Studio
2. AVD Manager → Create Virtual Device
3. Arrastra APK al emulador

**Verificar:**
- ✅ App se instala sin errores
- ✅ Se abre la PWA correctamente
- ✅ Navegación funciona
- ✅ Login/Register funcionan
- ✅ Funciona offline
- ✅ Notificaciones (si están habilitadas)

---

## 🎨 FASE 3: Preparar Assets para Play Store

### Paso 3.1: Screenshots (REQUERIDO)

**Necesitas mínimo 2 screenshots por tipo de dispositivo:**

**Para Teléfonos (1080 x 1920 px - 16:9):**
1. Screenshot de Dashboard/Home
2. Screenshot de Practice Mode
3. Screenshot de Exam Mode
4. Screenshot de Topics
5. Screenshot de Profile/Settings

**Cómo capturar:**
```
1. Abre Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Selecciona "Responsive"
4. Establece dimensiones: 1080 x 1920
5. Navega a cada pantalla
6. Captura con herramienta de screenshot
```

**O usa el emulador de Android Studio:**
```powershell
# Captura con adb
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/
```

### Paso 3.2: Feature Graphic (REQUERIDO)

**Dimensiones:** 1024 x 500 px

**Diseño sugerido:**
- Fondo: Navy Blue (#003A63) con gradiente
- Logo: Ícono de la app centrado
- Texto: "AME EXAM TRAINER" en Golden Yellow (#FFCC00)
- Subtítulo: "Prepare for your Aircraft Maintenance Engineer Exam"

**Herramientas:**
- Canva (tiene plantillas de feature graphic)
- Figma
- Adobe Photoshop/Illustrator

### Paso 3.3: Ícono de Alta Resolución (REQUERIDO)

**Dimensiones:** 512 x 512 px

Ya tienes este archivo: `public/icon-512x512.png`

### Paso 3.4: Descripción de la App

**Título (máx 30 caracteres):**
```
AME Exam Trainer
```

**Descripción Corta (máx 80 caracteres):**
```
Practice & master your Aircraft Maintenance Engineer certification exam
```

**Descripción Completa (máx 4000 caracteres):**
```markdown
🛩️ AME EXAM TRAINER - Your Path to Certification Success

Prepare for your Aircraft Maintenance Engineer (AME) certification exam with the most comprehensive and interactive training app available.

✨ KEY FEATURES:

📚 Extensive Question Bank
• 1000+ practice questions covering all exam topics
• Questions categorized by subject and difficulty
• Regular updates with new questions
• Community-contributed questions

🎯 Smart Practice Modes
• Practice Mode: Learn at your own pace with instant feedback
• Exam Mode: Simulate real exam conditions
• Topic-focused practice for targeted learning
• Randomized questions to improve retention

📊 Progress Tracking
• Detailed performance analytics
• Topic-level insights
• Identify weak areas for improvement
• Track your learning streak

🏆 Gamification & Motivation
• Earn badges for achievements
• Weekly challenges
• Leaderboards (optional)
• Study streak tracker

💡 Advanced Learning Tools
• Detailed explanations for all answers
• Reference materials and resources
• Bookmark difficult questions
• Comment system for discussions
• Vote on question quality

🔒 Secure & Private
• Secure authentication via Supabase
• Your data is encrypted
• GDPR compliant
• No ads

📱 Mobile-First Design
• Beautiful, intuitive interface
• Optimized for mobile devices
• Dark mode support
• Offline functionality - study anywhere, anytime
• Progressive Web App technology

👥 Community Features
• Report incorrect questions
• Suggest new questions
• Comment and discuss
• Help improve the platform

💼 Perfect For:
• AME certification candidates
• Aviation maintenance students
• Aircraft mechanics preparing for advancement
• Anyone studying aviation maintenance

🎓 Study Smarter, Not Harder
Our intelligent algorithm adapts to your learning style, focusing on areas where you need the most improvement.

🌟 Why Choose AME Exam Trainer?
• Created by aviation professionals for aviation professionals
• Constantly updated content
• Active community support
• Proven results - Join thousands of successful AME candidates

📲 Download now and start your journey to becoming a certified Aircraft Maintenance Engineer!

---
Support: ameexamtrainer@example.com
Privacy Policy: https://ame-exam-trainer.vercel.app/privacy
Terms of Service: https://ame-exam-trainer.vercel.app/terms
```

### Paso 3.5: Categoría y Contenido

**Categoría:** Education

**Content Rating:**
- Completa el cuestionario de content rating en Play Console
- Responde honestamente sobre el contenido de la app
- Resultado esperado: **Everyone** o **Everyone 10+**

**Etiquetas:**
```
AME, aviation, maintenance, engineer, exam, certification, training, education, study, practice
```

---

## 🎮 FASE 4: Subir a Google Play Console

### Paso 4.1: Crear Cuenta de Developer

1. Ve a [play.google.com/console](https://play.google.com/console)
2. **Pago único:** $25 USD (registro de por vida)
3. Completa información de cuenta
4. Acepta términos y condiciones

### Paso 4.2: Crear Nueva App

1. Click en **"Create app"**
2. Completa formulario:
   - **App name:** AME Exam Trainer
   - **Default language:** English (US)
   - **App or game:** App
   - **Free or paid:** Free
3. Acepta declaraciones
4. Click **"Create app"**

### Paso 4.3: Configurar Store Listing

**Dashboard principal → Store presence → Main store listing**

1. **App details:**
   - Short description: (copiar de arriba)
   - Full description: (copiar de arriba)

2. **Graphics:**
   - App icon: `icon-512x512.png`
   - Feature graphic: (tu diseño 1024x500)
   - Phone screenshots: (mínimo 2, máximo 8)
   - 7-inch tablet screenshots: (opcional)
   - 10-inch tablet screenshots: (opcional)

3. **Categorization:**
   - App category: Education
   - Tags: agregar tags relevantes

4. **Contact details:**
   - Email: tu_email@example.com
   - Phone: (opcional)
   - Website: https://ame-exam-trainer.vercel.app

5. **Privacy Policy:** (REQUERIDO)
   - URL: https://ame-exam-trainer.vercel.app/privacy

**Guardar cambios**

### Paso 4.4: Configurar Content Rating

1. **Dashboard → Policy → App content → Content ratings**
2. Click **"Start questionnaire"**
3. Selecciona categoría: **Education**
4. Responde preguntas:
   - ¿Violencia? No
   - ¿Contenido sexual? No
   - ¿Lenguaje inapropiado? No
   - ¿Drogas/alcohol? No
   - etc.
5. Submit para obtener rating
6. Resultado: **Everyone** o **Everyone 10+**

### Paso 4.5: Configurar App Access

1. **Dashboard → Policy → App content → App access**
2. Selecciona: **"All functionality is available without special access"**
3. (O explica si necesitas login para funcionalidad completa)
4. Si requiere login, proporciona credenciales de prueba:
   ```
   Test email: test@ameexamtrainer.com
   Test password: TestPassword123!
   ```

### Paso 4.6: Configurar Ads Declaration

1. **Dashboard → Policy → App content → Ads**
2. Selecciona: **"No, my app does not contain ads"**
3. Save

### Paso 4.7: Configurar Target Audience

1. **Dashboard → Policy → App content → Target audience**
2. **Target age:** 18 and over (o según corresponda)
3. **Appeal to children:** No
4. Save

### Paso 4.8: Configurar Privacy Policy

1. **Dashboard → Policy → App content → Privacy policy**
2. Agrega URL: https://ame-exam-trainer.vercel.app/privacy
3. Save

### Paso 4.9: Configurar Data Safety

**IMPORTANTE:** Declara qué datos recopilas

1. **Dashboard → Policy → App content → Data safety**
2. **Data collection and security:**
   - ¿Recopilas datos? **Yes**
   - ¿Compartes datos? **No**

3. **Data types collected:**
   ```
   Personal info:
   - ✅ Name
   - ✅ Email address
   
   App activity:
   - ✅ In-app search history
   - ✅ Other user-generated content
   
   App info and performance:
   - ✅ Crash logs
   - ✅ Diagnostics
   ```

4. **Data usage and handling:**
   Para cada tipo de dato, especifica:
   - **Collection:** Required
   - **Purpose:** App functionality, Analytics
   - **Encryption:** Data is encrypted in transit
   - **Deletion:** Users can request data deletion

5. Save

---

## 🚢 FASE 5: Crear Release

### Paso 5.1: Configurar Internal Testing Track (Opcional pero Recomendado)

1. **Dashboard → Release → Testing → Internal testing**
2. Click **"Create new release"**
3. **App bundles:**
   - Upload `app-release-signed.apk`
4. **Release name:** v1.0.0 (Beta)
5. **Release notes:**
   ```
   🚀 Initial release
   
   Features:
   • Practice mode with 1000+ questions
   • Exam simulation mode
   • Progress tracking
   • Offline support
   • Beautiful mobile-first design
   ```
6. Click **"Save"** → **"Review release"** → **"Start rollout to Internal testing"**

### Paso 5.2: Agregar Testers Internos

1. **Internal testing → Testers tab**
2. **Create email list:**
   - List name: "Internal Testers"
   - Add emails (máx 100)
3. Save

**Testers recibirán link para instalar:**
```
https://play.google.com/apps/internaltest/XXXXXXXXXX
```

### Paso 5.3: Testear Internamente (1-2 días)

**Verificar:**
- ✅ APK instala correctamente
- ✅ No hay crashes
- ✅ Todas las funciones trabajan
- ✅ Bugs son reportados y corregidos

### Paso 5.4: Crear Production Release

1. **Dashboard → Release → Production**
2. Click **"Create new release"**
3. **App bundles:**
   - Upload `app-release-signed.apk`
4. **Release name:** v1.0.0
5. **Release notes (en varios idiomas si es posible):**
   ```
   🎉 Welcome to AME Exam Trainer!
   
   Your complete Aircraft Maintenance Engineer exam preparation tool.
   
   Features:
   • 1000+ practice questions
   • Smart exam simulator
   • Detailed progress analytics
   • Offline study mode
   • Beautiful, intuitive interface
   • Community features
   
   Good luck with your certification! 🛩️
   ```
6. **Rollout percentage:** 
   - Start with 20% (recommended)
   - Or 100% for full launch
7. Click **"Save"** → **"Review release"**

### Paso 5.5: Review Final

**Antes de submit, verifica:**
- ✅ Store listing completo
- ✅ Todos los gráficos subidos
- ✅ Content rating aprobado
- ✅ App access configurado
- ✅ Data safety completado
- ✅ Privacy policy accesible
- ✅ APK firmado correctamente
- ✅ Testing interno pasado

**Click "Start rollout to Production"**

---

## ⏱️ FASE 6: Review de Google Play

### Paso 6.1: Esperar Review

**Timeline típico:**
- **Review inicial:** 1-3 días
- **Si hay problemas:** 1-2 días adicionales después de corrección
- **Aprobación:** 1-7 días en total

### Paso 6.2: Posibles Issues

**Issue común 1: Policy Violation**
- **Causa:** Contenido, privacidad, o permisos inapropiados
- **Solución:** Lee el email de Google, corrige, re-submit

**Issue común 2: Crashes al inicio**
- **Causa:** Google prueba automáticamente
- **Solución:** Test exhaustivo antes de submit

**Issue común 3: Metadata incompleto**
- **Causa:** Falta información en store listing
- **Solución:** Completa todos los campos requeridos

### Paso 6.3: App Aprobada ✅

**Recibirás email:**
```
✅ Your app "AME Exam Trainer" is now available on Google Play
```

**Tu app estará live en:**
```
https://play.google.com/store/apps/details?id=com.ameexamtrainer.app
```

---

## 📈 FASE 7: Post-Launch

### Paso 7.1: Monitoreo Inicial (Primera Semana)

**Google Play Console:**
1. **Dashboard → Quality → Android vitals**
   - Crash rate (objetivo: < 1%)
   - ANR rate (objetivo: < 0.5%)

2. **Dashboard → Users → Acquisition**
   - Installs diarias
   - Retención de usuarios

3. **Dashboard → Users → Reviews**
   - Lee y responde reviews
   - Identifica bugs comunes

**Vercel Analytics:**
1. Monitor server errors
2. Check API performance
3. Verify PWA metrics

### Paso 7.2: Responder a Reviews

**Responde a reviews en 24-48 horas:**

**Review positivo:**
```
Thank you for your kind review! We're thrilled AME Exam Trainer is helping you prepare for your certification. Good luck with your exam! 🛩️
```

**Review negativo:**
```
We're sorry to hear about your experience. We'd love to help resolve this issue. Please contact us at support@ameexamtrainer.com with more details. We're committed to making your study experience excellent.
```

**Bug report:**
```
Thank you for reporting this issue! Our team is investigating and will release a fix in the next update. We appreciate your patience and feedback.
```

### Paso 7.3: Planear Updates

**Update schedule sugerido:**
- **Minor updates (bug fixes):** Cada 2-3 semanas
- **Major updates (features):** Cada 1-2 meses

**Proceso de update:**
1. Fix bugs o add features
2. Update version en `twa-manifest.json`
3. Build nuevo APK con `bubblewrap build`
4. Upload a Play Console
5. Release notes claros
6. Gradual rollout (20% → 50% → 100%)

---

## 🆘 Troubleshooting

### Error: "ANDROID_HOME no encontrado"

**Solución:**
```powershell
# Verificar instalación de Android SDK
ls "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

# Si existe, configurar variable
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")

# Reiniciar PowerShell
```

### Error: "Keystore not found"

**Solución:**
```powershell
# Verifica ubicación del keystore
ls ame-trainer.keystore

# Si no existe, genera uno nuevo
keytool -genkey -v -keystore ame-trainer.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias ame-trainer
```

### Error: "APK signature invalid"

**Solución:**
```powershell
# Re-build con keystore correcto
bubblewrap build

# Verifica firma
jarsigner -verify -verbose -certs app-release-signed.apk
```

### Error: "Play Console rechaza APK"

**Posibles causas:**
1. **Version code muy bajo:**
   - Incrementa `versionCode` en `twa-manifest.json`
2. **Target SDK muy viejo:**
   - Update `targetSdkVersion` to 33 (Android 13)
3. **Permisos sospechosos:**
   - Review permisos en AndroidManifest.xml

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Vercel Docs](https://vercel.com/docs)
- [Bubblewrap Docs](https://github.com/GoogleChromeLabs/bubblewrap)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

### Herramientas Útiles
- [PWA Builder](https://www.pwabuilder.com/) - Validar PWA
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit PWA
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) - Generar assets

### Comunidad
- [Stack Overflow - Android](https://stackoverflow.com/questions/tagged/android)
- [Stack Overflow - PWA](https://stackoverflow.com/questions/tagged/progressive-web-apps)
- [Reddit - AndroidDev](https://www.reddit.com/r/androiddev/)

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

**Vercel:**
- [ ] App deployed a production
- [ ] HTTPS funcionando
- [ ] Variables de entorno configuradas
- [ ] Service Worker registrándose
- [ ] PWA installable
- [ ] Lighthouse score 90+

**TWA/APK:**
- [ ] Bubblewrap instalado
- [ ] Android SDK configurado
- [ ] Keystore generado y respaldado
- [ ] APK firmado correctamente
- [ ] APK testeado en dispositivo real

**Play Store:**
- [ ] Cuenta de Developer activa
- [ ] App creada en Play Console
- [ ] Store listing completo
- [ ] Screenshots subidos (mín 2)
- [ ] Feature graphic subido
- [ ] Content rating obtenido
- [ ] Privacy policy publicada
- [ ] Data safety completado
- [ ] APK subido
- [ ] Release notes escritos

**Post-Launch:**
- [ ] Monitoring configurado
- [ ] Analytics funcionando
- [ ] Respuesta a reviews activa
- [ ] Plan de updates definido

---

## 🎉 ¡Felicidades!

Si completaste todos estos pasos, tu app **AME Exam Trainer** está ahora disponible en Google Play Store. 🚀

**Próximos pasos:**
1. Compartir el link de Play Store
2. Promocionar en redes sociales
3. Recolectar feedback de usuarios
4. Planear próximas funcionalidades
5. Iterar y mejorar continuamente

**¡Éxito con tu app!** 🛩️✨

---

*Última actualización: 2024*
*Versión del documento: 1.0.0*
