"use client"

import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Pencil, Trash2, Check, X, AlertCircle } from "lucide-react"
import { useState } from "react"
import type { DraftQuestion } from "../types"

type Props = {
  question: DraftQuestion
  index: number
  onUpdate: (index: number, updated: DraftQuestion) => void
  onDelete: (index: number) => void
}

export function DraftQuestionCard({ question, index, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(question)

  const handleSave = () => {
    onUpdate(index, draft)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(question)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <MobileCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">Question {index + 1}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="default" onClick={handleSave}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Question Text</Label>
          <Textarea
            value={draft.question_text}
            onChange={(e) => setDraft({ ...draft, question_text: e.target.value })}
            rows={2}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Options</Label>
          <div className="space-y-2">
            {(["A", "B", "C", "D"] as const).map((letter) => (
              <div key={letter} className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                  {letter}
                </div>
                <Input
                  value={draft[`option_${letter.toLowerCase()}` as keyof DraftQuestion] as string || "---"}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [`option_${letter.toLowerCase()}`]: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Correct Answer</Label>
          <RadioGroup
            value={draft.correct_answer ?? undefined}
            onValueChange={(value) => setDraft({ ...draft, correct_answer: value as "A" | "B" | "C" | "D" })}
          >
            <div className="grid grid-cols-4 gap-2">
              {["A", "B", "C", "D"].map((letter) => (
                <label
                  key={letter}
                  htmlFor={`edit-answer-${index}-${letter}`}
                  className={`flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                    draft.correct_answer === letter
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={letter} id={`edit-answer-${index}-${letter}`} />
                  <span className="font-semibold text-sm ml-1">{letter}</span>
                </label>
              ))}
            </div>
          </RadioGroup>
          {!draft.correct_answer && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please select the correct answer
            </p>
          )}
        </div>

        {draft.explanation && (
          <div className="space-y-2">
            <Label className="text-sm">Explanation</Label>
            <Textarea
              value={draft.explanation}
              onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
              rows={2}
              className="text-sm"
            />
          </div>
        )}
      </MobileCard>
    )
  }

  return (
    <MobileCard className={`p-4 space-y-3 hover:shadow-md transition-shadow ${!question.correct_answer ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/10' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Question {index + 1}</span>
            {question.correct_answer ? (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  question.correct_answer === "A"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : question.correct_answer === "B"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : question.correct_answer === "C"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                }`}
              >
                Answer: {question.correct_answer}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Missing Answer
              </span>
            )}
            {question.confidence && question.confidence < 0.7 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                Low Confidence
              </span>
            )}
          </div>
          <p className="text-sm font-medium mb-3">{question.question_text}</p>
          <div className="space-y-1.5">
            {(["A", "B", "C", "D"] as const).map((letter) => (
              <div
                key={letter}
                className={`flex gap-2 items-start p-2 rounded-lg text-sm ${
                  question.correct_answer === letter ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                }`}
              >
                <span className="font-semibold text-primary flex-shrink-0">{letter})</span>
                <span className={question.correct_answer === letter ? "font-medium" : ""}>
                  {question[`option_${letter.toLowerCase()}` as keyof DraftQuestion] as string || "---"}
                </span>
              </div>
            ))}
          </div>
          {question.explanation && (
            <div className="mt-3 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Explanation:</span> {question.explanation}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(index)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </MobileCard>
  )
}
