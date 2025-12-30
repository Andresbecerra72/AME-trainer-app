"use client"

import { useState } from "react"
import { MobileCard } from "@/components/mobile-card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TopicSelector } from "@/components/topic-selector"
import { PrimaryButton } from "@/components/primary-button"
import { DraftQuestionsList } from "./DraftQuestionsList"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { DraftQuestion } from "../types"

type Props = {
  questions: DraftQuestion[]
  topics: any[]
  onSubmit: (payload: {
    topic_id: string
    difficulty: "easy" | "medium" | "hard"
    questions: DraftQuestion[]
  }) => Promise<void>
  isSubmitting: boolean
}

export function FileImportReviewCard({ questions, topics, onSubmit, isSubmitting }: Props) {
  const [editableDrafts, setEditableDrafts] = useState<DraftQuestion[]>(questions)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const handleUpdateDraft = (index: number, updated: DraftQuestion) => {
    const newDrafts = [...editableDrafts]
    newDrafts[index] = updated
    setEditableDrafts(newDrafts)
  }

  const handleDeleteDraft = (index: number) => {
    const newDrafts = editableDrafts.filter((_, i) => i !== index)
    setEditableDrafts(newDrafts)
  }

  const handleSubmit = async () => {
    await onSubmit({
      topic_id: selectedTopic,
      difficulty,
      questions: editableDrafts,
    })
  }

  // Check if any questions are missing correct_answer
  const incompleteDrafts = editableDrafts.filter(q => !q.correct_answer)
  const hasIncomplete = incompleteDrafts.length > 0

  return (
    <div className="space-y-6">
      {/* Alert if incomplete questions */}
      {hasIncomplete && (
        <MobileCard className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                Incomplete Questions Detected
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {incompleteDrafts.length} question{incompleteDrafts.length !== 1 ? 's' : ''} missing correct answer. 
                Please edit them before submitting.
              </p>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Complete questions indicator */}
      {!hasIncomplete && editableDrafts.length > 0 && (
        <MobileCard className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                All questions are complete and ready to submit!
              </p>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Topic and Difficulty Selection */}
      <MobileCard className="p-4 sm:p-5 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Select Topic</Label>
          <TopicSelector 
            topics={topics}
            selectedTopicId={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-difficulty" className="text-sm font-semibold">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as "easy" | "medium" | "hard")}>
            <SelectTrigger id="file-difficulty" className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">🟢 Easy</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="hard">🔴 Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </MobileCard>

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Review Extracted Questions
          </h3>
          <span className="text-xs text-muted-foreground">
            {editableDrafts.length} total
          </span>
        </div>
        <DraftQuestionsList
          questions={editableDrafts}
          onUpdate={handleUpdateDraft}
          onDelete={handleDeleteDraft}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 pb-20">
        <PrimaryButton
          fullWidth
          className="h-14 text-lg font-semibold"
          onClick={handleSubmit}
          disabled={isSubmitting || editableDrafts.length === 0 || !selectedTopic || hasIncomplete}
        >
          {isSubmitting 
            ? "Submitting..." 
            : `Submit ${editableDrafts.length} Question${editableDrafts.length !== 1 ? 's' : ''}`}
        </PrimaryButton>
      </div>
    </div>
  )
}
