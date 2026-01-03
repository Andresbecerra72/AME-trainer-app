"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createQuestion } from "@/lib/db-actions"

export function useManualQuestion() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [question, setQuestion] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [explanation, setExplanation] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createQuestion({
        question_text: question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer,
        explanation: explanation || undefined,
        topic_id: selectedTopic,
        difficulty,
      })

      toast({
        title: "Success",
        description: "Question submitted for review",
      })

      router.push("/protected/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    question,
    setQuestion,
    optionA,
    setOptionA,
    optionB,
    setOptionB,
    optionC,
    setOptionC,
    optionD,
    setOptionD,
    correctAnswer,
    setCorrectAnswer,
    selectedTopic,
    setSelectedTopic,
    difficulty,
    setDifficulty,
    explanation,
    setExplanation,
    handleSubmit,
  }
}
