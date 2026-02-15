"use client"

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useExamSignals } from "../hooks/useExamSignals"

interface ExamSignalControlsProps {
  questionId: string
  initialCount?: number
  initialActive?: boolean
  className?: string
}

const likelihoodLabels: Record<string, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
}

export function ExamSignalControls({
  questionId,
  initialCount,
  initialActive,
  className,
}: ExamSignalControlsProps) {
  const { count, likelihood, active, isLoading, toggle } = useExamSignals(questionId, {
    initialCount,
    initialActive,
  })

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        disabled={isLoading}
        className={cn("bg-transparent", active && "border-primary text-primary")}
      >
        <Eye className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Seen on TC exam</span>
        <span className="sm:hidden">Seen</span>
      </Button>
      <span className="text-xs sm:text-sm text-muted-foreground">{count} reported</span>
      <Badge variant="secondary" className="text-xs">
        Exam: {likelihoodLabels[likelihood]}
      </Badge>
    </div>
  )
}
