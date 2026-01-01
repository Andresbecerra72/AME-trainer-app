# 🎬 Inicio Rápido - Modo Visual

## 🚀 Opción 1: Script Automático (RECOMENDADO)

### Windows PowerShell
```powershell
# Navegar al proyecto
cd c:\Users\JACKA\Desktop\AME_app\ame-app-v1

# Ejecutar script de inicio
.\start-dev.ps1
```

**¿Qué hace el script?**
1. ✅ Verifica que Docker esté corriendo
2. ✅ Inicia Supabase en una terminal nueva
3. ✅ Inicia Next.js en otra terminal nueva
4. ✅ Muestra las URLs de acceso

**Resultado esperado:**
```
🚀 Iniciando entorno de desarrollo AME App...
📦 Iniciando Supabase...
⚛️ Iniciando Next.js...

========================================
✅ Servicios iniciados correctamente!
========================================

📊 Supabase Studio:
   http://127.0.0.1:54323

🌐 Next.js App:
   http://localhost:3000

📧 Inbucket (emails de prueba):
   http://127.0.0.1:54324

========================================
```

---

## 🔧 Opción 2: Manual (2 Terminales)

### Terminal 1: Supabase
```powershell
# Navegar al proyecto
cd c:\Users\JACKA\Desktop\AME_app\ame-app-v1

# Iniciar Supabase
npx supabase start
```

**Espera a ver esto:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

### Terminal 2: Next.js
```powershell
# En una NUEVA terminal (dejar la otra abierta)
cd c:\Users\JACKA\Desktop\AME_app\ame-app-v1

# Iniciar Next.js
pnpm dev
```

**Espera a ver esto:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## 🌐 Acceso a la aplicación

### 1️⃣ Abrir la App
**URL:** http://localhost:3000

**Primera vez:**
- Necesitas crear una cuenta
- O usar credenciales de prueba (si existen)

### 2️⃣ Abrir Supabase Studio
**URL:** http://127.0.0.1:54323

**Para qué sirve:**
- Ver tablas de la base de datos
- Ejecutar SQL
- Administrar Storage
- Ver usuarios autenticados

### 3️⃣ Ver emails de prueba
**URL:** http://127.0.0.1:54324

**Para qué sirve:**
- Ver emails de confirmación
- Ver emails de recuperación de contraseña
- No se envían emails reales en desarrollo

---

## 📊 Verificar que todo funciona

### Checklist rápido
Abre una terminal y ejecuta:
```powershell
npx supabase status
```

**Deberías ver:**
```
✔ API URL: http://127.0.0.1:54321
✔ DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
✔ Studio URL: http://127.0.0.1:54323
✔ Inbucket URL: http://127.0.0.1:54324
✔ Edge Functions: parse-import-job
```

---

## 🧪 Probar la función de importación

### Paso 1: Crear archivo de prueba
Crea un archivo `test.txt` con este contenido:

```
Q: ¿Cuál es la capital de Francia?
A) Londres
B) Berlín
C) París
D) Madrid
Answer: C

Q: ¿Cuántos continentes hay?
A) 5
B) 6
C) 7
D) 8
Answer: C
```

### Paso 2: Convertir a PDF
- Opción A: Abre el .txt en Word y guarda como PDF
- Opción B: Usa un conversor online: https://www.ilovepdf.com/txt_to_pdf

### Paso 3: Subir desde la UI
1. Ve a http://localhost:3000
2. Inicia sesión
3. Busca "Importar preguntas" o "Add Question"
4. Sube el PDF
5. Espera el procesamiento
6. Verifica las preguntas detectadas

---

## ⏹️ Detener servicios

### Opción 1: Script automático
```powershell
.\stop-dev.ps1
```

### Opción 2: Manual
```powershell
# En la terminal de Supabase
Ctrl+C  # o cierra la terminal

# Luego ejecuta
npx supabase stop

# En la terminal de Next.js
Ctrl+C  # o cierra la terminal
```

---

## 🔄 Reiniciar todo

Si algo no funciona:

```powershell
# 1. Detener todo
npx supabase stop
# Cerrar terminal de Next.js (Ctrl+C)

# 2. Limpiar (si es necesario)
npx supabase db reset

# 3. Iniciar de nuevo
.\start-dev.ps1
```

---

## ❓ Preguntas frecuentes

### ❓ ¿Cómo sé si Docker está corriendo?
Busca el ícono de Docker en la bandeja del sistema (systray) cerca del reloj.
- ✅ Verde: Docker corriendo
- ❌ Rojo o no visible: Docker detenido

### ❓ ¿Qué hago si el puerto 3000 está ocupado?
```powershell
# Cambiar puerto en package.json o usar:
pnpm dev -- -p 3001
```

### ❓ ¿Dónde veo los logs?
- **Next.js:** Terminal donde ejecutaste `pnpm dev`
- **Supabase:** Terminal donde ejecutaste `npx supabase start`
- **Edge Functions:** 
  ```powershell
  npx supabase functions serve parse-import-job --debug
  ```

### ❓ ¿Cómo aplico cambios en la base de datos?
```powershell
# Opción A: Reset completo (recomendado)
npx supabase db reset

# Opción B: Ejecutar SQL manualmente
# Ve a http://127.0.0.1:54323 → SQL Editor
# Copia y ejecuta el contenido de scripts/010_question_imports.sql
```

---

## 📚 Documentación completa

Para información más detallada, consulta:

1. **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** ← Empieza aquí
2. [EDGE_FUNCTION_SETUP.md](./EDGE_FUNCTION_SETUP.md) - Configuración detallada
3. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guía de pruebas
4. [START_SCRIPTS.md](./START_SCRIPTS.md) - Scripts disponibles

---

## 🎯 Flujo de trabajo diario

```powershell
# 1. Inicio del día
.\start-dev.ps1

# 2. Trabajar en tu código
# ... hacer cambios ...

# 3. Si cambias la base de datos
npx supabase db reset

# 4. Final del día
.\stop-dev.ps1
```

---

## 🎉 ¡Listo para desarrollar!

**Comando mágico para todo:**
```powershell
.\start-dev.ps1
```

Luego abre http://localhost:3000 y comienza a trabajar.
