import type { DraftQuestion } from "../types"

const norm = (s: string) => s.replace(/\r\n/g, "\n").trim()

// Basic heuristic parser (Phase 1)
// Supports common patterns:
// Q: ... / Question: ...
// A) ... B) ... C) ... D) ...
// Answer: A
export function parseQuestionsFromText(raw: string): DraftQuestion[] {
  const text = norm(raw)
  if (!text) return []

  const blocks = text.split(/\n{2,}/g).map(b => b.trim()).filter(Boolean)

  const out: DraftQuestion[] = []
  for (const block of blocks) {
    const q = block.match(/^(?:Q:|Question:)\s*(.+)$/m)?.[1]?.trim()
    const a = block.match(/^(?:A\)|A\.|A:)\s*(.+)$/m)?.[1]?.trim()
    const b = block.match(/^(?:B\)|B\.|B:)\s*(.+)$/m)?.[1]?.trim()
    const c = block.match(/^(?:C\)|C\.|C:)\s*(.+)$/m)?.[1]?.trim()
    const d = block.match(/^(?:D\)|D\.|D:)\s*(.+)$/m)?.[1]?.trim()
    const ans = block.match(/^(?:Answer:|Correct:)\s*([ABCD])\b/m)?.[1] as any

    if (!q || !a || !b || !c || !d) continue

    out.push({
      question_text: q,
      option_a: a,
      option_b: b,
      option_c: c,
      option_d: d,
      correct_answer: ans ?? null,
      confidence: ans ? 0.85 : 0.55,
    })
  }
  return out
}
