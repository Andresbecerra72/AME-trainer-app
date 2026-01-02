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
  raw_text: string | null
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
// PDF text extraction - SIMPLIFIED for Edge Functions
// Note: pdfjs-dist requires Node.js canvas which doesn't work in Deno
// Phase 2: Use external API or client-side extraction
// -------------------------
async function extractPdfText(pdfBytes: Uint8Array): Promise<string> {
  // For now, we'll return a clear error message
  // TODO: Implement using:
  // - Client-side extraction (pdfjs in browser)
  // - External API (PDF.co, Adobe PDF Services)
  // - Or Cloudflare Workers AI
  throw new Error(
    "PDF text extraction in Edge Functions is not yet implemented. " +
    "Please extract text on client-side using pdf.js and send raw_text directly, " +
    "or wait for Phase 2 implementation with external PDF API."
  )
}

function getPromptText(): string {
  return `
**IMPORTANTE: Lee y procesa TODAS las páginas del documento completo.**

Extrae TODAS las preguntas de selección múltiple de TODO el contenido proporcionado (todas las páginas del PDF o documento). No te detengas en la primera página, continúa extrayendo hasta el final.

Reglas:
- Cada pregunta debe tener el siguiente formato:
  {
    "question_text": "What is the best angle for a drill to cut aluminum?",
    "option_a": "80°",
    "option_b": "90°",
    "option_c": "70°",
    "option_d": "60°",
    "correct_answer": "B",
    "explanation": "Option B is correct because..."
  }
- explanation es opcional pero recomendado.
- Si no hay respuesta explícita en el texto, infiere la más probable y pon explanation indicando que fue inferida.
- Si faltan opciones, crea distractores plausibles basados en el tema.
- Mantén el idioma original del texto.
- NO incluyas markdown, ni texto adicional fuera del JSON.
- PROCESA TODO EL DOCUMENTO COMPLETO, no solo la primera página.

Responde ÚNICAMENTE con un objeto JSON con una clave "items" que contenga el array de TODAS las preguntas encontradas:
{
  "items": [ ... todas las preguntas extraídas de todo el documento ... ]
}
`.trim();
}

function getPrompt(data: string, raw_text: string | null): string {
  let option = " Archivo:\n      \"\"\"Revisa el archivo adjunto para extraer las preguntas.\"\"\"\n  ";

  if (data === 'texto' && raw_text) {
    option = `\n  Texto:\n      """${raw_text}"""\n  `;
  }
 
  const prompt = `
Extrae preguntas de selección múltiple del ${data}. Devuelve SOLO JSON válido.

Reglas:
- Cada pregunta debe tener el siguiente formato:
  {
    "question_text": "What is the best angle for a drill to cut aluminum?",
    "option_a": "80°",
    "option_b": "90°",
    "option_c": "70°",
    "option_d": "60°",
    "correct_answer": "B",
    "explanation": "Option B is correct because..."
  }
- explanation es opcional.
- Si no hay respuesta explícita, infiere la más probable y pon explanation indicando que fue inferida.
- Si no hay respuestas adicionales, crea distractores plausibles.
- Mantén el idioma original del texto.
- No incluyas markdown, ni texto adicional.
Responde con un objeto JSON con una clave "items" que contenga una lista de preguntas extraídas:
{
  "items": [ ... preguntas ... ]
}

${option}
`.trim();
  
  return prompt;
}

type MessageContent = string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

function getOpenAiContent(
  raw_text: string | null, 
  file_url: string | null,
  file_mime: string | null
): MessageContent {
  // Si ya tenemos el texto extraído, usarlo directamente
  if (raw_text) {
    return getPromptText() + `\n\nTexto a procesar:\n"""\n${raw_text}\n"""`;
  }
  
  // Si tenemos un archivo (PDF o imagen), usar formato multipart según docs de OpenAI
  if (file_url) {
    const isImage = file_mime?.startsWith('image/');
    const isPdf = file_mime?.includes('pdf') || file_url.toLowerCase().endsWith('.pdf');
    
    // Para imágenes y PDFs, OpenAI requiere formato array con image_url
    if (isPdf) {
      return [
        { type: "text", text: getPromptText() },
        { type: "input_file", file_url }
      ];
    }
   
    return [
      { type: "text", text: getPromptText() },
      { type: "image_url", image_url: { url: file_url } }
    ];
    
  }
  
  // Fallback: solo el prompt
  return getPromptText();
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
      .select("id,user_id,file_path,file_mime,status,raw_text")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }),
       { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const j = job as ImportJob

    // Only owner can trigger, OR admin roles (optional)
    // Here: owner only (simpler). If you want admin access, we can add role check.
    if (j.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }),
       { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // Mark processing
    await adminClient
      .from("question_imports")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId)

    console.log(`Processing job with file path: ${j.file_path}`)    
   
    let drafts: DraftQuestion[] = [];
    let fileUrl: string | null = null;

    // Si no hay raw_text, generar URL firmada del archivo en Storage
    if (!j.raw_text && j.file_path) {
      const bucket = "question-imports";
      const { data: urlData, error: urlError } = await adminClient.storage
        .from(bucket)
        .createSignedUrl(j.file_path, 3600); // URL válida por 1 hora

      if (urlError || !urlData?.signedUrl) {
        console.error("Failed to generate signed URL:", urlError);
        await adminClient
          .from("question_imports")
          .update({ 
            status: "failed", 
            error: `Failed to generate file URL: ${urlError?.message || 'Unknown error'}`,
            updated_at: new Date().toISOString()
          })
          .eq("id", jobId);
        
        return new Response(
          JSON.stringify({ error: "Failed to generate file URL", details: urlError?.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      fileUrl = urlData.signedUrl;
      console.log("Generated signed URL for file");
    }

    // Preparar el modelo según el tipo de contenido
    // Para PDFs e imágenes, necesitamos GPT-4o (mejor soporte para PDFs multipágina)
    const needsVision = !j.raw_text && (j.file_mime?.startsWith('image/') || j.file_mime?.includes('pdf'));
    const model = needsVision ? "gpt-4o" : "gpt-4-turbo-preview";

    console.log(`Using model: ${model}, needsVision: ${needsVision}`);

    // Llamamos a la API de OpenAI (Chat Completions)
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
            content: "You are a precise data extraction engine. You extract ALL educational questions from the ENTIRE document (all pages). You read and process complete PDF documents page by page and return all questions found in valid JSON format. Always maintain the original language of the content." 
          },
          { role: "user", content: getOpenAiContent(j.raw_text, fileUrl, j.file_mime) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 4096, // Máximo soportado por gpt-4o
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI API error:", errText);
      await adminClient
        .from("question_imports")
        .update({ 
          status: "failed", 
          error: `OpenAI API failed: ${errText}`,
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);
      
      return new Response(
        JSON.stringify({ error: "OpenAI request failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiJson = await openaiRes.json();
    console.log("OpenAI response:", JSON.stringify(openaiJson, null, 2));
    
    // En Chat Completions, la respuesta viene en choices[0].message.content
    const outputText = openaiJson.choices?.[0]?.message?.content;

    if (!outputText) {
      await adminClient
        .from("question_imports")
        .update({ 
          status: "failed", 
          error: "No content in OpenAI response",
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);
      
      return new Response(
        JSON.stringify({ error: "No output from OpenAI", response: openaiJson }), 
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("OpenAI output text:", outputText.substring(0, 500));

    let parsed: any;
    try {
      parsed = JSON.parse(outputText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      
      // Verificar si el JSON está truncado (finish_reason = length)
      const finishReason = openaiJson.choices?.[0]?.finish_reason;
      const isTruncated = finishReason === "length";
      
      const errorMsg = isTruncated 
        ? "El documento es muy largo. El modelo alcanzó el límite de tokens. Intenta dividir el PDF en archivos más pequeños (máximo 50-60 preguntas por archivo)."
        : "El modelo no retornó JSON válido";
      
      await adminClient
        .from("question_imports")
        .update({ 
          status: "failed", 
          error: errorMsg,
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);
      
      return new Response(
        JSON.stringify({ 
          error: errorMsg, 
          raw: outputText.substring(0, 1000),
          finish_reason: finishReason,
          is_truncated: isTruncated
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = Array.isArray(parsed) ? parsed : (parsed.items || []);
    if (!Array.isArray(items) || items.length === 0) {
      await adminClient
        .from("question_imports")
        .update({ 
          status: "failed", 
          error: "No questions extracted from text",
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);

      return new Response(
        JSON.stringify({ error: "No questions extracted", parsed }), 
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    drafts = items as DraftQuestion[];
    console.log(`Successfully extracted ${drafts.length} questions`);

    const mime = j.file_mime ?? "";
    
    // Log first question for debugging
    if (drafts.length > 0) {
      console.log('First question:', JSON.stringify(drafts[0], null, 2));
    }
    
    // Determine file type for stats
    let fileType = "text";
    if (mime.includes("pdf") || j.file_path.toLowerCase().endsWith(".pdf")) {
      fileType = "pdf";
    } else if (mime.startsWith("image/")) {
      fileType = "image";
    }
    
    const stats = {
      detected: drafts.length,
      type: fileType,
      parser: "openai_chat_completions",
      model,
      used_vision: needsVision,
      had_raw_text: !!j.raw_text,
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
