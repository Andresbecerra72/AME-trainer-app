"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

interface DuplicateResult {
  id: string
  question_text: string
  similarity: number
}

export async function checkQuestionDuplicates(questionText: string): Promise<DuplicateResult[]> {
  try {
    if (!questionText || questionText.length < 20) {
      return []
    }

    const supabase = await createSupabaseServerClient()

    // Fetch all approved questions
    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, question_text")
      .eq("status", "approved")

    if (error || !questions) {
      console.error("Error fetching questions:", error)
      return []
    }

    // Simple similarity check based on common words
    const words = questionText
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 3)

    const duplicates = questions
      .map((q) => {
        const qWords = q.question_text.toLowerCase().split(/\s+/)
        const commonWords = words.filter((w: string) => qWords.includes(w))
        const similarity = Math.round((commonWords.length / Math.max(words.length, qWords.length)) * 100)

        return { ...q, similarity }
      })
      .filter((q) => q.similarity >= 60)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)

    return duplicates
  } catch (error) {
    console.error("Error checking duplicates:", error)
    return []
  }
}
