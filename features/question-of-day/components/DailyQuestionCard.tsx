"use client"

import { useState, useEffect } from "react"
import { MobileCard } from "@/components/mobile-card"
import { AnswerButton } from "@/components/answer-button"
import { Calendar, Sparkles } from "lucide-react"
import type { QuestionOfDayQuestion } from "../types"

interface DailyQuestionCardProps {
  question: QuestionOfDayQuestion
  date?: string
  showChallengeBanner?: boolean
}

export function DailyQuestionCard({ question, date, showChallengeBanner = true }: DailyQuestionCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>(date || "")
  
  useEffect(() => {
    // Format date on client side to avoid hydration mismatch
    const dateToFormat = date ? new Date(date) : new Date()
    setFormattedDate(dateToFormat.toLocaleDateString())
  }, [date])

  return (
    <div className="space-y-6">
      {showChallengeBanner && (
        <MobileCard className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Daily Challenge</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </MobileCard>
      )}

      <MobileCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">{question.topic?.code || "General"}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                question.difficulty === "easy"
                  ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                  : question.difficulty === "hard"
                    ? "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-balance leading-relaxed">{question.question_text}</h3>

          <div className="space-y-2">
            {(["A", "B", "C", "D"] as const).map((option) => {
              const optionText = question[`option_${option.toLowerCase()}` as keyof QuestionOfDayQuestion]
              return (
                <AnswerButton
                  key={option}
                  letter={option}
                  text={String(optionText)}
                  correct={question.correct_answer === option}
                  disabled
                />
              )
            })}
          </div>

          {question.explanation && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Explanation:</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground">
            Contributed by {question.author?.full_name || "Anonymous"}
          </div>
        </div>
      </MobileCard>
    </div>
  )
}
