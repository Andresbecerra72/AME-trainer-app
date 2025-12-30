"use client"

import { useMemo, useState } from "react"
import { parsePastedQuestions } from "../parsers/pasteText.parser"
import { createQuestionsBatch } from "../server/questionImport.actions"
import { type DraftQuestion } from "../types"

export function useQuestionImport() {
  const [pastedText, setPastedText] = useState("")
  const drafts = useMemo(() => parsePastedQuestions(pastedText), [pastedText])

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitPaste(payload: { 
    topic_id: string
    difficulty: "easy" | "medium" | "hard"
    questions?: DraftQuestion[] // Allow passing edited questions
  }) {
    setIsSubmitting(true)
    try {
      // Use provided questions or fall back to parsed drafts
      const questionsToSubmit = payload.questions || drafts
      return await createQuestionsBatch({ 
        topic_id: payload.topic_id,
        difficulty: payload.difficulty,
        questions: questionsToSubmit 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { pastedText, setPastedText, drafts, submitPaste, isSubmitting }
}
