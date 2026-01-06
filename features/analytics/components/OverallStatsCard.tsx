"use client"

import { MobileCard } from "@/components/mobile-card"
import { Target } from "lucide-react"
import type { OverallStats } from "../types"

interface OverallStatsCardProps {
  stats: OverallStats
}

export function OverallStatsCard({ stats }: OverallStatsCardProps) {
  return (
    <MobileCard className="space-y-4">
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Your Stats
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {stats.reputation}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Reputation</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {stats.questionsContributed}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Questions</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {stats.totalExams}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Exams Taken</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {stats.averageScore}%
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Avg Score</div>
        </div>
      </div>
    </MobileCard>
  )
}
