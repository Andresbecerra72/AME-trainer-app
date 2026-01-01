# 🧪 Script de prueba para la Edge Function

## Prueba manual con curl

### 1. Primero, obtén tu token de acceso

Inicia sesión en la app (http://localhost:3000) y ejecuta esto en la consola del navegador (F12):

```javascript
// En la consola del navegador
const session = await (await fetch('/api/auth/session')).json();
console.log('Token:', session.access_token);
```

O desde Supabase Studio (http://127.0.0.1:54323):
1. Ve a **Authentication** → **Users**
2. Click en un usuario
3. Copia el **Access Token**

### 2. Crea un job de prueba manualmente

Ejecuta esto en SQL Editor de Supabase Studio:

```sql
-- Obtén tu user_id
SELECT id FROM auth.users LIMIT 1;

-- Crea un job de prueba (reemplaza USER_ID_AQUI)
INSERT INTO question_imports (
  user_id, 
  file_path, 
  file_name, 
  file_mime, 
  status
)
VALUES (
  'USER_ID_AQUI',
  'test-path.pdf',
  'test.pdf',
  'application/pdf',
  'pending'
)
RETURNING id;

-- Copia el ID del job
```

### 3. Prueba la Edge Function

```powershell
# Reemplaza YOUR_ACCESS_TOKEN y YOUR_JOB_ID
curl -X POST http://127.0.0.1:54321/functions/v1/parse-import-job `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"jobId": "YOUR_JOB_ID"}'
```

## Prueba con archivo real

### Paso 1: Crear archivo de prueba

Crea un archivo `test-questions.txt` con este contenido:

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

Q: ¿Qué lenguaje de programación usa este proyecto?
A) Python
B) TypeScript
C) Java
D) Ruby
Answer: B
```

### Paso 2: Convertir a PDF

Opciones:
1. Usa Word/LibreOffice para convertir txt → PDF
2. Usa un conversor online: https://www.ilovepdf.com/txt_to_pdf
3. Usa PowerShell:

```powershell
# Instalar módulo (solo primera vez)
Install-Module -Name PSWritePDF

# Convertir a PDF
$text = Get-Content .\test-questions.txt -Raw
New-PDF -FilePath .\test-questions.pdf {
    Add-PDFText -Text $text -FontSize 12
}
```

### Paso 3: Subir desde la UI

1. Ve a http://localhost:3000
2. Inicia sesión
3. Ve a la página de importación de preguntas
4. Sube `test-questions.pdf`
5. Observa el progreso en tiempo real

## Verificar resultados

### En Supabase Studio

```sql
-- Ver todos los jobs
SELECT 
  id,
  user_id,
  file_name,
  status,
  stats,
  error,
  created_at
FROM question_imports
ORDER BY created_at DESC;

-- Ver las preguntas detectadas de un job específico
SELECT 
  id,
  file_name,
  status,
  jsonb_array_length(result) as detected_questions,
  result
FROM question_imports
WHERE id = 'YOUR_JOB_ID';

-- Ver el texto extraído
SELECT raw_text 
FROM question_imports 
WHERE id = 'YOUR_JOB_ID';
```

### En la consola del navegador

```javascript
// Ver el job completo
const jobId = 'YOUR_JOB_ID';
const response = await fetch(`/api/imports/${jobId}`);
const data = await response.json();
console.log('Job:', data);
console.log('Preguntas detectadas:', data.result);
```

## Formato esperado de preguntas

La Edge Function reconoce estos formatos:

### Formato 1: Con "Q:" y "Answer:"
```
Q: Texto de la pregunta
A) Opción A
B) Opción B
C) Opción C
D) Opción D
Answer: C
```

### Formato 2: Con "Question:" y "Correct:"
```
Question: Texto de la pregunta
A. Opción A
B. Opción B
C. Opción C
D. Opción D
Correct: B
```

### Formato 3: Con numeración
```
1. Texto de la pregunta
   A: Opción A
   B: Opción B
   C: Opción C
   D: Opción D
   Answer: A
```

## Casos de prueba

### ✅ Caso exitoso
- Archivo: PDF válido con texto extraíble
- Formato: Preguntas con estructura reconocible
- Resultado esperado: `status: "ready"`, N preguntas detectadas

### ⚠️ Caso con advertencias
- Archivo: PDF con algunas preguntas sin respuesta marcada
- Resultado esperado: Preguntas detectadas con `confidence < 0.8`

### ❌ Caso de error
- Archivo: PDF escaneado (solo imágenes)
- Resultado esperado: `status: "failed"`, error: "Image OCR not implemented yet"

## Debugging

### Ver logs en tiempo real

Terminal 1:
```powershell
npx supabase functions serve parse-import-job --debug
```

Terminal 2:
```powershell
# Hacer la petición
curl http://127.0.0.1:54321/functions/v1/parse-import-job ...
```

### Ver logs de la base de datos

```sql
-- Ver errores recientes
SELECT id, file_name, error, created_at
FROM question_imports
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting común

### Error: "Unauthorized"
- ✅ Verifica que el token sea válido (no expirado)
- ✅ Confirma que el header Authorization esté presente
- ✅ Revisa que el usuario exista en auth.users

### Error: "Job not found"
- ✅ Verifica que el jobId sea correcto
- ✅ Confirma que el job pertenezca al usuario autenticado
- ✅ Revisa las RLS policies

### Error: "Failed to download file"
- ✅ Verifica que el archivo exista en Storage
- ✅ Confirma que el path sea correcto: `userId/jobId/filename.pdf`
- ✅ Revisa las políticas de Storage

### No detecta preguntas (detected: 0)
- ✅ Verifica que el PDF tenga texto extraíble (no sea imagen)
- ✅ Confirma que el formato coincida con los patrones
- ✅ Revisa el campo `raw_text` para ver qué se extrajo
- ✅ Ajusta los regex en `parseQuestionsFromText()` si es necesario

## 📊 Métricas esperadas

- **Tiempo de procesamiento**: 1-5 segundos para PDFs pequeños (<10 páginas)
- **Precisión de detección**: 80-95% para formatos estándar
- **Tasa de éxito**: >95% para PDFs con texto extraíble

## 🎯 Próximos pasos (Fase 2)

- [ ] Implementar OCR para PDFs escaneados (Tesseract.js)
- [ ] Usar IA (OpenAI/Anthropic) para mejorar el parsing
- [ ] Detección de duplicados antes de insertar
- [ ] Validación de coherencia (respuesta correcta existe en las opciones)
- [ ] Soporte para imágenes JPEG/PNG directamente
