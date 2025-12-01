"use client"

import { cn } from "@/lib/utils"

interface AnswerButtonProps {
  letter: string
  text: string
  selected?: boolean
  correct?: boolean
  wrong?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function AnswerButton({ letter, text, selected, correct, wrong, onClick, disabled }: AnswerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all",
        "flex items-start gap-3 min-h-[64px]",
        !selected && !correct && !wrong && "border-border bg-card hover:border-primary/50",
        selected && !correct && !wrong && "border-primary bg-primary/5",
        correct && "border-green-500 bg-green-50 dark:bg-green-950/20",
        wrong && "border-red-500 bg-red-50 dark:bg-red-950/20",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm",
          !selected && !correct && !wrong && "bg-muted text-muted-foreground",
          selected && !correct && !wrong && "bg-primary text-primary-foreground",
          correct && "bg-green-500 text-white",
          wrong && "bg-red-500 text-white",
        )}
      >
        {letter}
      </div>
      <span className="flex-1 text-sm leading-relaxed pt-0.5">{text}</span>
    </button>
  )
}
