"use client"

import { MobileCard } from "@/components/mobile-card"
import { TrendingDown, AlertCircle } from "lucide-react"
import type { TopicPerformance } from "../types"

interface WeakAreasCardProps {
  areas: TopicPerformance[]
}

export function WeakAreasCard({ areas }: WeakAreasCardProps) {
  if (areas.length === 0) return null

  return (
    <MobileCard className="space-y-4 bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800">
      <h2 className="font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-red-600" />
        Areas to Improve
      </h2>
      <div className="space-y-3">
        {areas.map((topic) => (
          <div key={topic.id} className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-red-900 dark:text-red-100 text-sm sm:text-base line-clamp-2">
                {topic.title}
              </div>
              <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                {topic.questionsAttempted} question{topic.questionsAttempted !== 1 ? 's' : ''} attempted
              </div>
            </div>
            <div className="text-red-900 dark:text-red-100 font-semibold text-sm sm:text-base whitespace-nowrap">
              {topic.averageScore}%
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-red-200 dark:border-red-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
          Focus your studies on these topics to improve your overall performance
        </p>
      </div>
    </MobileCard>
  )
}
