"use client"

import { Flame, Trophy } from "lucide-react"
import { MobileCard } from "./mobile-card"

interface StudyStreakWidgetProps {
  currentStreak: number
  longestStreak: number
}

export function StudyStreakWidget({ currentStreak, longestStreak }: StudyStreakWidgetProps) {
  return (
    <MobileCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-950/20 p-3 rounded-xl">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Study Streak</div>
            <div className="text-2xl font-bold text-foreground">{currentStreak} days</div>
          </div>
        </div>
        <div className="text-center">
          <Trophy className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">Best</div>
          <div className="text-sm font-semibold text-foreground">{longestStreak}</div>
        </div>
      </div>
    </MobileCard>
  )
}
