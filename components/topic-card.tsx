"use client"

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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate">{title}</h3>
            <p className="text-sm text-muted-foreground">{questionsCount} questions</p>
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
