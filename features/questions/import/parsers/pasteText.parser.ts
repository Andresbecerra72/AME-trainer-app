import { DraftQuestion } from "../types"


const normalize = (s: string) => s.replace(/\r\n/g, "\n").trim()

// Supports formats like:
// Q: ...
// A) ...
// B) ...
// C) ...
// D) ...
// Answer: A
export function parsePastedQuestions(raw: string): DraftQuestion[] {
  console.log("raw pasted text:", raw)  
  const text = normalize(raw)
  console.log("normalized text:", text)
  if (!text) return []

  // Split by blank lines (two or more newlines)
  const blocks = text.split(/\n{2,}/g).map(b => b.trim()).filter(Boolean)
  console.log("text blocks:", blocks)

  const out: DraftQuestion[] = []

  for (const block of blocks) {
    const qMatch = block.match(/^(?:Q:|Question:)\s*(.+)$/m)
    const aMatch = block.match(/^(?:A\)|A\.|A:)\s*(.+)$/m)
    const bMatch = block.match(/^(?:B\)|B\.|B:)\s*(.+)$/m)
    const cMatch = block.match(/^(?:C\)|C\.|C:)\s*(.+)$/m)
    const dMatch = block.match(/^(?:D\)|D\.|D:)\s*(.+)$/m)
    const ansMatch = block.match(/^(?:Answer:|Correct:)\s*([ABCD])\b/m)
    const expMatch = block.match(/^(?:Explanation:)\s*([\s\S]+)$/m)

    console.log("qMatch:", qMatch)
    console.log("aMatch:", aMatch)

    if (!qMatch || !aMatch || !bMatch || !cMatch || !dMatch || !ansMatch) continue

    out.push({
      question_text: qMatch[1].trim(),
      option_a: aMatch[1].trim(),
      option_b: bMatch[1].trim(),
      option_c: cMatch[1].trim(),
      option_d: dMatch[1].trim(),
      correct_answer: ansMatch[1] as DraftQuestion["correct_answer"],
      explanation: expMatch?.[1]?.trim(),
    })
  }

  return out
}
