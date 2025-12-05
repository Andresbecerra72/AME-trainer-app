import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { questionText } = await request.json()

    if (!questionText || questionText.length < 20) {
      return NextResponse.json({ duplicates: [] })
    }

    const supabase = await createSupabaseServerClient()

    // Fetch all approved questions
    const { data: questions } = await supabase.from("questions").select("id, question_text").eq("status", "approved")

    if (!questions) {
      return NextResponse.json({ duplicates: [] })
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

    return NextResponse.json({ duplicates })
  } catch (error) {
    console.error("Error checking duplicates:", error)
    return NextResponse.json({ duplicates: [] })
  }
}
