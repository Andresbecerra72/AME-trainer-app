"use client"

import { MobileCard } from "@/components/mobile-card"
import type { TopicPerformance } from "../types"

interface RecommendationsCardProps {
  weakAreas: TopicPerformance[]
}

export function RecommendationsCard({ weakAreas }: RecommendationsCardProps) {
  return (
    <MobileCard className="bg-primary/5 border-primary/20">
      <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
        Recommendations
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
        <li className="flex gap-2">
          <span className="flex-shrink-0">•</span>
          <span>Continue contributing quality questions to earn more reputation</span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0">•</span>
          <span>Engage with the community by commenting on questions</span>
        </li>
        {weakAreas.length > 0 && (
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>
              Focus on improving weak areas: {weakAreas.map((t) => t.title).join(", ")}
            </span>
          </li>
        )}
        <li className="flex gap-2">
          <span className="flex-shrink-0">•</span>
          <span>Take practice exams regularly to track your progress</span>
        </li>
      </ul>
    </MobileCard>
  )
}
