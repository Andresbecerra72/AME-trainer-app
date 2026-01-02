import type { DraftQuestion } from "../types"

const norm = (s: string) => s.replace(/\r\n/g, "\n").trim()

// Basic heuristic parser (Phase 1)
// Supports multiple formats:
// Format 1: Q: ... / Question: ... with A) B) C) D) options and Answer: X
// Format 2: Direct answer (e.g., "3- Question? Answer text.")
export function parseQuestionsFromText(raw: string): DraftQuestion[] {
  const text = norm(raw)
  if (!text) return []

  const blocks = text.split(/\n{2,}/g).map(b => b.trim()).filter(Boolean)

  const out: DraftQuestion[] = []
  for (const block of blocks) {
    // Try multiple choice format first
    const mcResult = parseMultipleChoice(block)
    if (mcResult) {
      out.push(mcResult)
      continue
    }
    
    // Try direct answer format
    const directResult = parseDirectAnswer(block)
    if (directResult) {
      out.push(directResult)
    }
  }
  return out
}

// Parse multiple choice format
function parseMultipleChoice(block: string): DraftQuestion | null {
  const q = block.match(/^(?:\d+[\s\-\.]*)?(?:Q\s*:|Question\s*:)?\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const a = block.match(/^\s*(?:A\s*\)|A\s*\.|A\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const b = block.match(/^\s*(?:B\s*\)|B\s*\.|B\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const c = block.match(/^\s*(?:C\s*\)|C\s*\.|C\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const d = block.match(/^\s*(?:D\s*\)|D\s*\.|D\s*:)\s*(.+?)(?=\n|$)/im)?.[1]?.trim()
  const ans = block.match(/(?:Answer\s*:|Correct\s*:)\s*([ABCD])\b/im)?.[1]?.toUpperCase() as any

  if (!q || !a || !b || !c || !d) return null

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
  const questionMatch = block.match(/^(?:\d+[\s\-\.]*)?(.+?\?)/im)
  if (!questionMatch) return null
  
  const question = questionMatch[1].trim()
  const remainingText = block.substring(questionMatch[0].length).trim()
  if (!remainingText) return null
  
  const answer = remainingText
    .replace(/^[\s\-\.,:;]+/, '')
    .replace(/[\s\.]+$/, '')
    .trim()
  
  if (!answer || answer.length < 2) return null
  
  return {
    question_text: question,
    option_a: answer,
    option_b: '---',
    option_c: '---',
    option_d: '---',
    correct_answer: 'A',
    confidence: 0.70,
  }
}
