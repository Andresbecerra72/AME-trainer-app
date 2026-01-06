"use client"

import { MobileCard } from "@/components/mobile-card"
import { TrendingUp } from "lucide-react"
import type { TopicPerformance } from "../types"

interface StrongAreasCardProps {
  areas: TopicPerformance[]
}

export function StrongAreasCard({ areas }: StrongAreasCardProps) {
  if (areas.length === 0) return null

  return (
    <MobileCard className="space-y-4 bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800">
      <h2 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        Strong Areas
      </h2>
      <div className="space-y-3">
        {areas.map((topic) => (
          <div key={topic.id} className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-green-900 dark:text-green-100 text-sm sm:text-base line-clamp-2">
                {topic.title}
              </div>
              <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                {topic.questionsAttempted} question{topic.questionsAttempted !== 1 ? 's' : ''} attempted
              </div>
            </div>
            <div className="text-green-900 dark:text-green-100 font-semibold text-sm sm:text-base whitespace-nowrap">
              {topic.averageScore}%
            </div>
          </div>
        ))}
      </div>
    </MobileCard>
  )
}
