import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"
// -------------------------
// CORS Headers
// -------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En producción, cámbialo por tu dominio real
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// -------------------------
// Types
// -------------------------
type DraftQuestion = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D" | null
  explanation?: string
  confidence?: number
}

type ImportJob = {
  id: string
  user_id: string
  file_path: string
  file_mime: string | null
  status: string
  raw_text: string
  raw_pages?: any // JSONB array of pages
}

// -------------------------
// Simple heuristic parser (Phase 1)
// -------------------------
function parseQuestionsFromText(raw: string): DraftQuestion[] {
  const text = raw.replace(/\r\n/g, "\n").trim()
  if (!text) return []

  // Split by double line breaks or more (questions are separated by blank lines)
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  console.log(`Found ${blocks.length} blocks to parse`)
  
  const out: DraftQuestion[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    console.log(`\n--- Parsing block ${i + 1} ---`)
    console.log('Block content:', block.substring(0, 200))
    
    // Try Format 1: Multiple choice with options (Q: ... A) B) C) D) Answer:)
    const mcResult = parseMultipleChoice(block)
    if (mcResult) {
      console.log('✓ Parsed as multiple choice')
      out.push(mcResult)
      continue
    }
    
    // Try Format 2: Direct answer question (e.g., "3- Question? Answer text.")
    const directResult = parseDirectAnswer(block)
    if (directResult) {
      console.log('✓ Parsed as direct answer')
      out.push(directResult)
      continue
    }
    
    console.log('✗ Could not parse block')
  }

  return out
}

// Parse multiple choice format: Q: ... A) ... B) ... C) ... D) ... Answer: X
function parseMultipleChoice(block: string): DraftQuestion | null {
  // More flexible regex patterns that handle extra spaces and line breaks
  const q = block.match(/^(?:\d+[\s\-\.]*)?(?:Q\s*:|Question\s*:)?\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const a = block.match(/^\s*(?:A\s*\)|A\s*\.|A\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const b = block.match(/^\s*(?:B\s*\)|B\s*\.|B\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const c = block.match(/^\s*(?:C\s*\)|C\s*\.|C\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const d = block.match(/^\s*(?:D\s*\)|D\s*\.|D\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const ans = block.match(/(?:Answer\s*:|Correct\s*:)\s*([ABCD])\b/im)?.[1]?.toUpperCase() as
    | "A"
    | "B"
    | "C"
    | "D"
    | undefined

  // Need at least question and all 4 options
  if (!q || !a || !b || !c || !d) {
    return null
  }

  return {
    question_text: q,
    option_a: a,
    option_b: b,
    option_c: c,
    option_d: d,
    correct_answer: ans ?? null,
    confidence: ans ? 0.85 : 0.55,
  }
}

// Parse direct answer format: "3- Question? Answer text."
function parseDirectAnswer(block: string): DraftQuestion | null {
  // Extract question (ends with ?)
  const questionMatch = block.match(/^(?:\d+[\s\-\.]*)?(.+?\?)/im)
  if (!questionMatch) return null
  
  const question = questionMatch[1].trim()
  
  // Extract answer (everything after the question mark, cleaned up)
  const remainingText = block.substring(questionMatch[0].length).trim()
  if (!remainingText) return null
  
  // Clean up the answer text
  const answer = remainingText
    .replace(/^[\s\-\.,:;]+/, '') // Remove leading punctuation
    .replace(/[\s\.]+$/, '')      // Remove trailing punctuation
    .trim()
  
  if (!answer || answer.length < 2) return null
  
  return {
    question_text: question,
    option_a: answer,
    option_b: '---',
    option_c: '---',
    option_d: '---',
    correct_answer: 'A',
    confidence: 0.70, // Lower confidence for direct answers
  }
}

// -------------------------
// OpenAI Prompt
// -------------------------
function getPromptText(): string {
  return `
**INSTRUCCIÓN CRÍTICA: Debes extraer TODAS las preguntas del documento completo.**

Eres un experto en extraer preguntas de exámenes de cualquier formato. Tu tarea es identificar y estructurar CADA pregunta que encuentres.

IMPORTANTE: Las preguntas pueden venir en MUCHOS formatos diferentes:
- Con numeración: "1. ¿Pregunta?" o "1) ¿Pregunta?" o "Q1: ¿Pregunta?"
- Con opciones etiquetadas: A) B) C) D) o a) b) c) d) o A. B. C. D.
- Sin etiquetas claras pero con múltiples opciones listadas
- Respuestas al final: "Respuesta: A" o "Correcta: A" o "R: A"
- Formato de párrafo continuo

EJEMPLOS de formatos que DEBES reconocer:

Formato 1 (con etiquetas claras):
1. ¿Cuál es la capital de Francia?
A) Londres
B) París
C) Madrid
D) Roma
Respuesta: B

Formato 2 (opciones listadas sin etiquetas):
¿Cuál es la capital de Francia?
Londres
París
Madrid
Roma
Correcta: París

Formato 3 (texto continuo):
1. ¿Cuál es la capital de Francia? a) Londres b) París c) Madrid d) Roma. Respuesta: b

Formato 4 (sin respuesta explícita):
¿Cuál es la capital de Francia?
- Londres
- París
- Madrid
- Roma

FORMATO DE SALIDA (JSON estricto):
{
  "items": [
    {
      "question_text": "¿Cuál es la capital de Francia?",
      "option_a": "Londres",
      "option_b": "París",
      "option_c": "Madrid",
      "option_d": "Roma",
      "correct_answer": "B",
      "explanation": "París es la capital de Francia"
    }
  ]
}

REGLAS OBLIGATORIAS:
1. EXTRAE TODAS las preguntas - no te detengas después de unas pocas
2. Si faltan opciones, créalas basándote en el contexto
3. Si no hay respuesta correcta explícita, infiere la más lógica (indica en explanation: "Inferida del contexto")
4. Mantén el idioma original
5. NO incluyas markdown
6. Asegúrate de que correct_answer sea una letra: "A", "B", "C" o "D"

El array "items" debe contener TODAS las preguntas del texto completo.
`.trim();
}

// -------------------------
// Handler
// -------------------------
Deno.serve(async (req: Request) => {
  console.log("AQUI Edge function")
   // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!

    if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // 1) Authenticated caller (uses user token)
    const authHeader = req.headers.get("Authorization") ?? ""
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser()

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
       { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // openai api key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY secret" }), 
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const body = await req.json().catch(() => null)
    const jobId = body?.jobId as string | undefined
    if (!jobId) {
      return new Response(JSON.stringify({ error: "Missing jobId" }),
       { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // 2) Service client for Storage + DB updates
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Load job
    const { data: job, error: jobError } = await adminClient
      .from("question_imports")
      .select("id,user_id,file_path,file_mime,status,raw_text,raw_pages")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }),
       { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const j = job as ImportJob

    // Only owner can trigger
    if (j.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }),
       { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // Validate raw_text is provided
    if (!j.raw_text || j.raw_text.trim().length === 0) {
      await adminClient
        .from("question_imports")
        .update({ 
          status: "failed", 
          error: "No text provided. Text extraction must be done on the client side before calling this function.",
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);

      return new Response(
        JSON.stringify({ error: "raw_text is required and must not be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark processing
    await adminClient
      .from("question_imports")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId)

    // Check if we should process page by page
    const pages = j.raw_pages && Array.isArray(j.raw_pages) ? j.raw_pages : null
    const usePageByPage = pages && pages.length > 0
    
    console.log(`Processing job ${jobId} with ${j.raw_text.length} characters of text`)
    
    if (usePageByPage) {
      console.log(`📄 Page-by-page mode: ${pages.length} pages detected`)
      console.log(`Pages sizes: ${pages.map((p: string, i: number) => `P${i+1}:${p.length}ch`).join(', ')}`)
    } else {
      console.log(`📝 Single text mode: processing as one chunk`)
      console.log(`\n=== FIRST 500 CHARS ===`)
      console.log(j.raw_text.substring(0, 500))
      console.log(`\n=== MIDDLE 500 CHARS (around position ${Math.floor(j.raw_text.length / 2)}) ===`)
      console.log(j.raw_text.substring(Math.floor(j.raw_text.length / 2) - 250, Math.floor(j.raw_text.length / 2) + 250))
      console.log(`\n=== LAST 300 CHARS ===`)
      console.log(j.raw_text.substring(j.raw_text.length - 300))
    }
    console.log(`\n===================`)
   
    let drafts: DraftQuestion[] = []
    let totalTokensUsed = 0

    // Process page by page if available, otherwise process as single chunk
    if (usePageByPage) {
      console.log(`\n🔄 Starting page-by-page processing (parallel batches)...`)
      
      // Process pages in parallel batches to reduce total time
      // Batch size of 5 = ~18 sec per batch for 21 pages = ~4 batches = ~72 seconds total
      const BATCH_SIZE = 5 // Process 5 pages at a time
      const batches: number[][] = []
      
      // Split pages into batches
      for (let i = 0; i < pages.length; i += BATCH_SIZE) {
        batches.push(Array.from({ length: Math.min(BATCH_SIZE, pages.length - i) }, (_, j) => i + j))
      }
      
      console.log(`Processing ${pages.length} pages in ${batches.length} batches of ${BATCH_SIZE}`)
      
      // Process each batch in parallel
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length}: Processing pages ${batch.map(i => i + 1).join(', ')}`)
        
        // Process all pages in this batch in parallel
        const batchPromises = batch.map(async (pageIndex) => {
          const pageText = pages[pageIndex]
          const pageNum = pageIndex + 1
          
          console.log(`--- Page ${pageNum}/${pages.length} (${pageText.length} chars) ---`)
          
          // Prepare content for OpenAI
          const promptWithText = getPromptText() + `\n\nTexto a procesar (Página ${pageNum} de ${pages.length}):\n"""\n${pageText}\n"""`
          
          const estimatedInputTokens = Math.ceil(pageText.length / 4) + 300
          const model = "gpt-4o-mini" // Use mini for individual pages (faster + cheaper)
          const maxTokens = 4096
          
          console.log(`Page ${pageNum}: ~${estimatedInputTokens} input tokens, model: ${model}`)
          
          try {
            const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  { 
                    role: "system", 
                    content: "You are an expert at extracting exam questions from ANY format. Extract ALL questions from this page, regardless of formatting. Be flexible with format recognition but strict with JSON output. Maintain original language." 
                  },
                  { role: "user", content: promptWithText },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
                max_tokens: maxTokens,
              }),
            })

            if (!openaiRes.ok) {
              const errText = await openaiRes.text()
              console.error(`Page ${pageNum} OpenAI error:`, errText)
              return { pageNum, questions: [], tokens: 0 }
            }

            const openaiJson = await openaiRes.json()
            const tokensUsed = openaiJson.usage?.total_tokens || 0
            
            const outputText = openaiJson.choices?.[0]?.message?.content
            
            if (!outputText) {
              console.warn(`Page ${pageNum}: No output from OpenAI`)
              return { pageNum, questions: [], tokens: tokensUsed }
            }

            let parsed: any
            try {
              parsed = JSON.parse(outputText)
            } catch (parseError) {
              console.error(`Page ${pageNum} JSON parse error:`, parseError)
              return { pageNum, questions: [], tokens: tokensUsed }
            }

            const items = Array.isArray(parsed) ? parsed : (parsed.items || [])
            if (Array.isArray(items) && items.length > 0) {
              console.log(`✓ Page ${pageNum}: Extracted ${items.length} questions`)
              return { pageNum, questions: items as DraftQuestion[], tokens: tokensUsed }
            } else {
              console.log(`⚠ Page ${pageNum}: No questions found`)
              return { pageNum, questions: [], tokens: tokensUsed }
            }
          } catch (pageError: any) {
            console.error(`Page ${pageNum} processing error:`, pageError.message)
            return { pageNum, questions: [], tokens: 0 }
          }
        })
        
        // Wait for all pages in this batch to complete
        const batchResults = await Promise.all(batchPromises)
        
        // Accumulate results
        for (const result of batchResults) {
          drafts.push(...result.questions)
          totalTokensUsed += result.tokens
        }
        
        console.log(`✓ Batch ${batchIndex + 1} complete: ${drafts.length} total questions so far`)
      }
      
      console.log(`\n✓ Page-by-page processing complete: ${drafts.length} total questions from ${pages.length} pages`)
      console.log(`Total tokens used: ${totalTokensUsed}`)
      
    } else {
      // Original single-chunk processing
      const promptWithText = getPromptText() + `\n\nTexto a procesar:\n"""\n${j.raw_text}\n"""`

      console.log('Sending text to OpenAI')
      console.log('Text length:', j.raw_text.length, 'characters')
      console.log(`Estimated tokens: ~${Math.ceil(j.raw_text.length / 4)} (text) + ~300 (prompt) = ~${Math.ceil(j.raw_text.length / 4) + 300} total`)

      const estimatedInputTokens = Math.ceil(j.raw_text.length / 4) + 300
      let model = "gpt-4-turbo-preview"
      let maxTokens = 4096
      
      if (estimatedInputTokens > 30000) {
        console.log('Large document detected, using gpt-4o for higher output capacity')
        model = "gpt-4o"
        maxTokens = 16000
      }

      console.log(`Using model: ${model} with max_tokens: ${maxTokens}`)

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { 
              role: "system", 
              content: "You are an expert at extracting exam questions from ANY format. Your job is to identify EVERY question in the document, regardless of formatting. Questions may be numbered, bulleted, in paragraphs, or poorly formatted. Extract them ALL and structure them consistently. Be flexible with format recognition but strict with JSON output. If you see text that looks like questions with multiple options, extract it. Maintain original language." 
            },
            { role: "user", content: promptWithText },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: maxTokens,
        }),
      })

      if (!openaiRes.ok) {
        const errText = await openaiRes.text()
        console.error("OpenAI API error:", errText)
        await adminClient
          .from("question_imports")
          .update({ 
            status: "failed", 
            error: `OpenAI API failed: ${errText}`,
            updated_at: new Date().toISOString()
          })
          .eq("id", jobId)
        
        return new Response(
          JSON.stringify({ error: "OpenAI request failed", details: errText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const openaiJson = await openaiRes.json()
      totalTokensUsed = openaiJson.usage?.total_tokens || 0
      console.log("OpenAI response:", JSON.stringify(openaiJson, null, 2))
      
      const outputText = openaiJson.choices?.[0]?.message?.content

      if (!outputText) {
        await adminClient
          .from("question_imports")
          .update({ 
            status: "failed", 
            error: "No content in OpenAI response",
            updated_at: new Date().toISOString()
          })
          .eq("id", jobId)
        
        return new Response(
          JSON.stringify({ error: "No output from OpenAI", response: openaiJson }), 
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      console.log("OpenAI output text:", outputText.substring(0, 500))

      let parsed: any
      try {
        parsed = JSON.parse(outputText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        
        const finishReason = openaiJson.choices?.[0]?.finish_reason
        const isTruncated = finishReason === "length"
        
        const errorMsg = isTruncated 
          ? `El documento es muy largo y la respuesta fue truncada (límite de ${maxTokens} tokens alcanzado). Preguntas extraídas hasta donde alcanzó el modelo. Para procesar documentos más grandes, considera dividir el PDF en archivos más pequeños.`
          : "El modelo no retornó JSON válido"
        
        await adminClient
          .from("question_imports")
          .update({ 
            status: "failed", 
            error: errorMsg,
            updated_at: new Date().toISOString()
          })
          .eq("id", jobId)
        
        return new Response(
          JSON.stringify({ 
            error: errorMsg, 
            raw: outputText.substring(0, 1000),
            finish_reason: finishReason,
            is_truncated: isTruncated
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const items = Array.isArray(parsed) ? parsed : (parsed.items || [])
      if (!Array.isArray(items) || items.length === 0) {
        await adminClient
          .from("question_imports")
          .update({ 
            status: "failed", 
            error: "No questions extracted from text",
            updated_at: new Date().toISOString()
          })
          .eq("id", jobId)

        return new Response(
          JSON.stringify({ error: "No questions extracted", parsed }), 
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      drafts = items as DraftQuestion[]
    }
    
    console.log(`Successfully extracted ${drafts.length} questions`)

    // Determine file type for stats (based on mime or file path)
    const mime = j.file_mime ?? ""
    let fileType = "text"
    if (mime.includes("pdf") || j.file_path.toLowerCase().endsWith(".pdf")) {
      fileType = "pdf"
    } else if (mime.startsWith("image/")) {
      fileType = "image"
    }
    
    const stats = {
      detected: drafts.length,
      type: fileType,
      parser: usePageByPage ? "openai_page_by_page" : "openai_chat_completions",
      processing_mode: usePageByPage ? "page_by_page" : "single_chunk",
      total_pages: usePageByPage && pages ? pages.length : 1,
      text_length: j.raw_text.length,
      total_tokens_used: totalTokensUsed,
      processed_at: new Date().toISOString(),
    };

    // Update job with results
    const { error: updateError } = await adminClient
      .from("question_imports")
      .update({
        status: "ready",
        raw_text: j.raw_text, // Keep original raw_text
        result: drafts,
        stats,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      console.error("Failed to update job:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update job", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Job ${jobId} completed successfully with ${drafts.length} questions`);
    
    return new Response(
      JSON.stringify({ ok: true, jobId, detected: drafts.length, stats }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Edge function error:", msg);
    console.error("Stack:", e instanceof Error ? e.stack : "No stack trace");
    
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})
