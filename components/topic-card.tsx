//"use client"

import { MobileCard } from "./mobile-card"
import type { LucideIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TopicCardProps {
  title: string
  icon: LucideIcon
  progress: number
  questionsCount: number
  onClick?: () => void
}

export function TopicCard({ title, icon: Icon, progress, questionsCount, onClick }: TopicCardProps) {
  return (
    <MobileCard onClick={onClick} className="space-y-3">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{questionsCount} questions</p>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </MobileCard>
  )
}
