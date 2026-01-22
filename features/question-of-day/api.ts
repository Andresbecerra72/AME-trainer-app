"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { QuestionOfDayResponse } from "./types"

/**
 * Get the question of the day for today's date
 * If no question is assigned, randomly select an approved question
 * and create a new question of the day entry
 */
export async function getQuestionOfDay(): Promise<QuestionOfDayResponse | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const today = new Date().toISOString().split("T")[0]

    // Try to fetch existing question of the day
    const { data: qotd, error: qotdError } = await supabase
      .from("question_of_day")
      .select(
        `
        *,
        question:questions(
          *,
          topic:topics(id, name, code),
          author:profiles!questions_author_id_fkey(id, full_name, avatar_url)
        )
      `,
      )
      .eq("date", today)
      .single()

    if (qotd && qotd.question) {
      return {
        question: qotd.question,
        date: today,
      }
    }

    // If no question exists for today, select a random approved question
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select(
        `
        *,
        topic:topics(id, name, code),
        author:profiles!questions_author_id_fkey(id, full_name, avatar_url)
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100)

    if (questionsError || !questions || questions.length === 0) {
      console.error("[question-of-day] Error fetching questions:", questionsError)
      return null
    }

    // Randomly select a question
    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)]

    // Try to create question of the day entry
    // Note: If RLS policies are not set up, this may fail but we still return the question
    const { error: insertError } = await supabase.from("question_of_day").insert({
      question_id: selectedQuestion.id,
      date: today,
    })

    if (insertError) {
      console.error("[question-of-day] Error inserting question of the day:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      })
      console.warn("[question-of-day] Continuing without saving to database. Please run migration 014_question_of_day_rls.sql")
    }

    // Return the question even if insert fails
    return {
      question: selectedQuestion,
      date: today,
    }
  } catch (err) {
    console.error("[question-of-day] Unexpected error:", err)
    return null
  }
}

/**
 * Get the question of the day for a specific date
 */
export async function getQuestionOfDayByDate(date: string): Promise<QuestionOfDayResponse | null> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: qotd, error } = await supabase
      .from("question_of_day")
      .select(
        `
        *,
        question:questions(
          *,
          topic:topics(id, name, code),
          author:profiles!questions_author_id_fkey(id, full_name, avatar_url)
        )
      `,
      )
      .eq("date", date)
      .single()

    if (error || !qotd || !qotd.question) {
      return null
    }

    return {
      question: qotd.question,
      date: qotd.date,
    }
  } catch (err) {
    console.error("[question-of-day] Error fetching question by date:", err)
    return null
  }
}
