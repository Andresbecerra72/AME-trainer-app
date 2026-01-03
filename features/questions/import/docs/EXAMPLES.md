# Ejemplos de Formato para Importación de Preguntas

## Formato Básico

```
Q: ¿Cuál es la capital de Francia?
A) Madrid
B) París
C) Londres
D) Berlín
Answer: B

Q: ¿Cuántos continentes hay en la Tierra?
A) 5
B) 6
C) 7
D) 8
Answer: C
```

## Formato con Explicación

```
Q: ¿Qué es HTTP?
A) Un lenguaje de programación
B) Un protocolo de transferencia de hipertexto
C) Un sistema operativo
D) Una base de datos
Answer: B
Explanation: HTTP (HyperText Transfer Protocol) es el protocolo utilizado para la transferencia de información en la World Wide Web.

Q: ¿Cuál es el puerto predeterminado para HTTPS?
A) 80
B) 8080
C) 443
D) 22
Answer: C
Explanation: El puerto 443 es el puerto estándar para conexiones HTTPS seguras, mientras que el puerto 80 se usa para HTTP.
```

## Variaciones de Formato Soportadas

El parser es flexible y acepta estas variaciones:

### Usando puntos en lugar de paréntesis
```
Q: ¿Cuál es el lenguaje de programación más usado en 2024?
A. JavaScript
B. Python
C. Java
D. C++
Answer: B
```

### Usando dos puntos
```
Question: ¿Qué significa CSS?
A: Cascading Style Sheets
B: Computer Style System
C: Creative Style Solutions
D: Compiled Style Scripts
Correct: A
```

## Ejemplo Completo para Pruebas (AME - Aviación)

```
Q: ¿Qué instrumento indica la velocidad vertical de una aeronave?
A) Altímetro
B) Velocímetro
C) Variómetro
D) Horizonte artificial
Answer: C
Explanation: El variómetro (VSI - Vertical Speed Indicator) muestra la velocidad de ascenso o descenso de la aeronave en pies por minuto.

Q: ¿Cuál es la presión atmosférica estándar al nivel del mar?
A) 1013.25 hPa
B) 1000 hPa
C) 1020 hPa
D) 1015 hPa
Answer: A
Explanation: La presión atmosférica estándar al nivel del mar es 1013.25 hPa (hectopascales) o 29.92 inHg.

Q: ¿Qué significa VFR en aviación?
A) Very Fast Rules
B) Visual Flight Rules
C) Vertical Flight Route
D) Variable Flight Range
Answer: B

Q: ¿A qué altitud se encuentra la troposfera en promedio?
A) 5,000 pies
B) 10,000 pies
C) 36,000 pies
D) 50,000 pies
Answer: C
Explanation: La troposfera se extiende desde el nivel del mar hasta aproximadamente 36,000 pies (11 km) en latitudes medias.

Q: ¿Qué instrumento mide la altura sobre el nivel del mar?
A) Brújula
B) Altímetro
C) Anemómetro
D) Barómetro
Answer: B

Q: ¿Cuál es el código ICAO para México?
A) MEX
B) MX
C) MM
D) MMEX
Answer: C
Explanation: El código ICAO (International Civil Aviation Organization) de dos letras para México es MM.
```

## Notas Importantes

1. **Separación de Preguntas**: Siempre deja una línea en blanco entre cada pregunta
2. **Formato Consistente**: Mantén el mismo formato de opciones en todas las preguntas (A), B), C), D))
3. **Respuesta Correcta**: Debe ser solo la letra (A, B, C o D)
4. **Explicación Opcional**: Puedes omitir la explicación si no es necesaria
5. **Sin Números**: No uses números antes de la Q: (ej: no escribas "1. Q:")

## Solución de Problemas

- **No se parsean las preguntas**: Verifica que haya líneas en blanco entre preguntas
- **Falta una opción**: Asegúrate de tener exactamente 4 opciones (A, B, C, D)
- **No reconoce la respuesta**: Usa "Answer:" o "Correct:" seguido de solo la letra
- **Formato inconsistente**: Elige un formato (paréntesis, puntos o dos puntos) y úsalo en todas las preguntas
