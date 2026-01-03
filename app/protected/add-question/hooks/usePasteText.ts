"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useQuestionImport } from "@/features/questions/import/hooks/useQuestionImport"
import { DraftQuestion } from "@/features/questions/import/types"

export function usePasteText() {
  const router = useRouter()
  const { toast } = useToast()
  const { pastedText, setPastedText, drafts, submitPaste, isSubmitting } = useQuestionImport()
  
  const [editableDrafts, setEditableDrafts] = useState<DraftQuestion[]>([])
  const [showParsedQuestions, setShowParsedQuestions] = useState(false)
  const [batchTopic, setBatchTopic] = useState("")
  const [batchDifficulty, setBatchDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const handleParse = () => {
    if (drafts.length === 0) {
      toast({
        title: "No questions found",
        description: "Please check your text format and try again.",
        variant: "destructive",
      })
      return
    }

    setEditableDrafts(drafts)
    setShowParsedQuestions(true)
    toast({
      title: "Questions parsed",
      description: `Found ${drafts.length} question${drafts.length === 1 ? '' : 's'}. Review and submit when ready.`,
    })
  }

  const handleUpdateDraft = (index: number, updated: DraftQuestion) => {
    const newDrafts = [...editableDrafts]
    newDrafts[index] = updated
    setEditableDrafts(newDrafts)
  }

  const handleDeleteDraft = (index: number) => {
    const newDrafts = editableDrafts.filter((_, i) => i !== index)
    setEditableDrafts(newDrafts)
    toast({
      title: "Question removed",
      description: "The question has been removed from the batch.",
    })
  }

  const handleSubmitBatch = async () => {
    if (!batchTopic) {
      toast({
        title: "Topic required",
        description: "Please select a topic for these questions.",
        variant: "destructive",
      })
      return
    }

    if (editableDrafts.length === 0) {
      toast({
        title: "No questions to submit",
        description: "Please parse some questions first.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await submitPaste({
        topic_id: batchTopic,
        difficulty: batchDifficulty,
        questions: editableDrafts,
      })

      toast({
        title: "Success",
        description: `${result.inserted} question${result.inserted === 1 ? '' : 's'} submitted for review.`,
      })

      resetState()
      router.push("/protected/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit questions. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetState = () => {
    setPastedText("")
    setEditableDrafts([])
    setShowParsedQuestions(false)
    setBatchTopic("")
    setBatchDifficulty("medium")
  }

  const handleBackToEdit = () => {
    setShowParsedQuestions(false)
    setEditableDrafts([])
  }

  return {
    pastedText,
    setPastedText,
    editableDrafts,
    showParsedQuestions,
    batchTopic,
    setBatchTopic,
    batchDifficulty,
    setBatchDifficulty,
    isSubmitting,
    handleParse,
    handleUpdateDraft,
    handleDeleteDraft,
    handleSubmitBatch,
    handleBackToEdit,
  }
}
