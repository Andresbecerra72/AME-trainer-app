"use client"

import { MobileCard } from "./mobile-card"
import { CheckCircle2, Circle } from "lucide-react"

interface QuestionCardProps {
  questionSnippet: string
  isAnswered: boolean
  onClick?: () => void
}

export function QuestionCard({ questionSnippet, isAnswered, onClick }: QuestionCardProps) {
  return (
    <MobileCard onClick={onClick} className="space-y-2">
      <div className="flex items-start gap-3">
        {isAnswered ? (
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground line-clamp-3">{questionSnippet}</p>
        </div>
      </div>
      {isAnswered && (
        <div className="flex items-center gap-1.5 ml-8">
          <span className="text-xs font-medium text-primary">Correct answer set</span>
        </div>
      )}
    </MobileCard>
  )
}
