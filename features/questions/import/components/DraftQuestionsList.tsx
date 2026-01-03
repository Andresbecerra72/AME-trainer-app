"use client"

import { DraftQuestionCard } from "./DraftQuestionCard"
import { EmptyState } from "@/components/empty-state"
import { FileQuestion } from "lucide-react"
import { DraftQuestion } from "../types"

type Props = {
  questions: DraftQuestion[]
  onUpdate: (index: number, updated: DraftQuestion) => void
  onDelete: (index: number) => void
}

export function DraftQuestionsList({ questions, onUpdate, onDelete }: Props) {
  if (questions.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No questions parsed yet"
        description="Paste your questions in the format above and click 'Auto-Parse Questions' to preview them here."
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {questions.length} {questions.length === 1 ? "Question" : "Questions"} Parsed
        </h3>
      </div>
      {questions.map((question, index) => (
        <DraftQuestionCard
          key={index}
          question={question}
          index={index}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
