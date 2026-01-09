# Google Play Console - Step by Step Guide

## 🚀 Complete Walkthrough for Submission

---

## FASE 1: PREPARACIÓN (Hoy)

### ✅ Paso 1: Tomar Screenshots
**Tiempo: 10 minutos**

En tu Galaxy A15:
1. Abre la app "AME Exam Trainer"
2. Abre "Configuración" → "Avanzado" → "Opciones" → "Captura de pantalla"
3. Toma **4-5 screenshots** de diferentes pantallas
4. Guárdalas en tu computadora en una carpeta

**Screenshots necesarios:**
- 📱 Pantalla de inicio/login
- 📱 Dashboard principal
- 📱 Sección de preguntas
- 📱 Progreso/estadísticas

**Dónde encontrar:**
- En tu Galaxy: Galería → Screenshots
- Usa `adb pull` si no puedes transferir manualmente:
  ```bash
  adb pull /sdcard/Pictures/Screenshots ~/Desktop/PlayStoreScreenshots
  ```

### ✅ Paso 2: Crear Feature Graphic
**Tiempo: 15 minutos**

1. Ve a https://www.canva.com
2. Busca: "Google Play Feature Graphic 1024x500"
3. Crea tu gráfico con:
   - Fondo azul marino (#003A63)
   - Texto en amarillo (#FFCC00)
   - Título: "AME Exam Trainer"
   - Subtítulo: "Master Your Certification"
4. Descargalo como PNG

**Canva Templates (buscar en Google Play requirements):**
- Usa template de Google Play
- Dimensiones exactas: 1024x500 px

### ✅ Paso 3: Preparar Textos
**Ya tienes todo en PLAY_STORE_ASSETS.md**

Copia los textos:
- ✅ App Name: `AME Exam Trainer`
- ✅ Short Description: Copiado
- ✅ Full Description: Copiado
- ✅ Promotional Text: Copiado

---

## FASE 2: CREAR CUENTA EN GOOGLE PLAY

### Paso 1: Ir a Google Play Console
**Tiempo: 5 minutos**

1. Ve a https://play.google.com/console
2. Haz click en "Crear cuenta"
3. Usa tu Google account (o crea uno nuevo)
4. Paga el **$25 de registro** (one-time)
5. Completa tu perfil de desarrollador:
   - Nombre
   - País
   - Email
   - Teléfono

### Paso 2: Crear Nueva Aplicación
**Tiempo: 5 minutos**

En Google Play Console:
1. Click **"Crear App"**
2. Rellena:
   - **App name**: `AME Exam Trainer`
   - **Default language**: English
   - **App type**: Application
   - **Free or Paid**: Free
   - **Category**: Education

3. Click **"Crear"**

---

## FASE 3: LLENAR INFORMACIÓN DE LA APP

### Paso 1: App Details (Detalles)
**Ubicación**: Izquierda → "App details"

1. **App name**: `AME Exam Trainer` ✓
2. **Short description**: `Master your Aircraft Maintenance Engineer certification` ✓
3. **Full description**: (Copiar de PLAY_STORE_ASSETS.md) ✓

### Paso 2: Imágenes
**Ubicación**: "App details" → "Graphics"

1. **App Icon** (512x512):
   - Sube desde: `public/icon-512x512.png`
   
2. **Feature Graphic** (1024x500):
   - Sube la que creaste en Canva
   
3. **Screenshots** (1080x1920 cada uno):
   - Sube los 4-5 screenshots de tu Galaxy A15
   - Max 8 screenshots

### Paso 3: Categoría & Contenido
**Ubicación**: "App details"

1. **Category**: Education ✓
2. **Content rating**: 
   - Completa el IARC questionnaire
   - Selecciona: PEGI 3 / ESRB E ✓

### Paso 4: Privacidad
**Ubicación**: "App details" → "Privacy policy"

1. **Privacy policy URL**:
   ```
   https://v0-ame-exam-trainer-app.vercel.app/privacy
   ```

---

## FASE 4: SUBIR EL APK

### Paso 1: Ir a Release
**Ubicación**: Izquierda → "Release" → "Production"

1. Click **"Create new release"**
2. Click **"Upload APK"**

### Paso 2: Seleccionar el APK
**Ubicación**: Dialog de carga

1. Busca y selecciona:
   ```
   /Users/andresbecerra/Desktop/AME Trainer/ame-apk/AME Trainer.apk
   ```
2. Click "Upload"
3. Espera a que cargue (1-2 min)

### Paso 3: Release Notes
**Ubicación**: Campo de "Release notes"

Escribe:
```
Initial Release

✓ Comprehensive AME study materials
✓ Practice questions with explanations
✓ Performance tracking
✓ Community features
✓ Offline support
✓ Mobile optimized interface

Thank you for downloading AME Exam Trainer!
```

---

## FASE 5: DISTRIBUCIÓN

### Paso 1: Audience
**Ubicación**: Izquierda → "Audience"

1. **Audience type**: 18+
2. **Category**: Education
3. **Content Guidelines**: Marca como cumplido ✓

### Paso 2: Countries
**Ubicación**: "Audience" → "Countries"

Opción 1: Todos los países (recomendado para empezar)
Opción 2: Selecciona países específicos

### Paso 3: Rating (IARC)
**Ubicación**: "Content rating"

1. Click **"Start questionnaire"**
2. Completa el formulario:
   - Violence: None
   - Sexual Content: None
   - Profanity: None
   - Alcohol: None
3. Envía
4. Google automáticamente asigna rating

---

## FASE 6: REVISAR Y ENVIAR

### Paso 1: Checklist Final
**Ubicación**: "Release overview"

Verifica que todos tengan ✅:
- [ ] App details completado
- [ ] Imágenes subidas (icon, feature, screenshots)
- [ ] Content rating completado
- [ ] Privacy policy URL añadida
- [ ] APK subido
- [ ] Release notes completado
- [ ] Audience seleccionado
- [ ] Countries seleccionados

### Paso 2: Enviar para Review
**Ubicación**: Release overview → "Review release"

1. Click **"Review release"**
2. Lee las políticas de Google Play
3. Marca: "I confirm that my app complies with Google Play policies"
4. Click **"Submit for review"**

### Paso 3: Confirmación
- Verás: ✅ "Submitted for review"
- Recibirás un email de confirmación
- Status cambiará a "Processing"

---

## ⏳ QUÉ PASA DESPUÉS

### Timeline
- **Horas 0-24**: En revisión
- **Día 1-7**: Google revisa (usualmente 2-3 días)
- **Aprobación**: App aparece en Play Store
- **Rechazo**: Recibirás email con motivos, puedes corregir y reenviar

### Monitorear Status
1. Ve a Google Play Console
2. "Release" → "Production"
3. Busca "Status" - verás:
   - ⏳ "In review" - esperando
   - ✅ "Approved" - ¡listo!
   - ❌ "Rejected" - necesita cambios

### Cuando Esté Aprobado
La app aparecerá en:
```
https://play.google.com/store/apps/details?id=com.ameexamtrainer.app
```

---

## 🆘 PROBLEMAS COMUNES

### "Missing content rating"
→ Completa el IARC questionnaire en "Content rating"

### "Privacy policy not valid"
→ Asegúrate que la URL sea correcta:
   `https://v0-ame-exam-trainer-app.vercel.app/privacy`

### "Screenshots dimensions incorrect"
→ Usa 1080x1920 o 1440x2560 (9:16 aspect ratio)

### "Icon/Graphics quality poor"
→ Asegúrate que sean PNG de alta calidad (512x512 icon mínimo)

### "App crashes on install"
→ Re-verifica que el APK está correctamente firmado
→ Reinstala en Galaxy A15 para verificar

---

## 📊 INFORMACIÓN IMPORTANTE

| Aspecto | Valor |
|--------|-------|
| **App Name** | AME Exam Trainer |
| **Package ID** | com.ameexamtrainer.app |
| **Category** | Education |
| **Pricing** | Free |
| **Minimum Android** | 5.0 (API 21) |
| **Content Rating** | PEGI 3 / ESRB E |
| **APK Size** | 1.7 MB |
| **Review Time** | 1-7 days (avg 2-3) |

---

## ✅ PRÓXIMO PASO

¿Cuándo quieres empezar?

**Opción A**: Hoy mismo (1.5 horas)
- [ ] Tomar screenshots (10 min)
- [ ] Crear feature graphic (15 min)  
- [ ] Crear cuenta Play Console (20 min)
- [ ] Llenar toda la información (30 min)
- [ ] Subir APK (5 min)
- [ ] Enviar para review (5 min)

**Opción B**: Mañana
- Tendrás app en Play Store para pasado mañana

¿Comenzamos?

---
