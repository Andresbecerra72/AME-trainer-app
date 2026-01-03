"use client"

import { Target, TrendingUp, Award } from "lucide-react"
import { MobileCard } from "@/components/mobile-card"
import type { ExamStats } from "@/features/exams/exam-history.logic"

interface ExamStatsCardProps {
  stats: ExamStats
}

export function ExamStatsCard({ stats }: ExamStatsCardProps) {
  return (
    <MobileCard>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="text-center">
          <Target className="w-5 h-5 text-primary mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalExams}</div>
          <div className="text-xs text-muted-foreground">Exams Taken</div>
        </div>
        <div className="text-center">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500 mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.avgScore}%</div>
          <div className="text-xs text-muted-foreground">Avg Score</div>
        </div>
        <div className="text-center col-span-2 sm:col-span-1">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-500 mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalCorrect}</div>
          <div className="text-xs text-muted-foreground">Total Correct</div>
        </div>
      </div>
    </MobileCard>
  )
}
