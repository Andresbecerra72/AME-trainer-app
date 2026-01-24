"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditQuestionDialog } from "./edit-question-dialog"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { questionKeys } from "../hooks/use-questions"

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  topic_id: string
  difficulty: string
  explanation?: string
}

type EditButtonClientProps = {
  question: Question
  topics: Array<{ id: string; name: string }>
}

export function EditButtonClient({ question, topics }: EditButtonClientProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    // Invalidate all question queries to refresh the list
    queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
    router.refresh()
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 min-w-[100px]"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3 w-3 mr-1" />
        Edit
      </Button>

      <EditQuestionDialog
        question={question}
        topics={topics}
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </>
  )
}
