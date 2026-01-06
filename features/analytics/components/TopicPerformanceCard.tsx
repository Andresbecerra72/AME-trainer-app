"use client"

import { MobileCard } from "@/components/mobile-card"
import { ProgressBar } from "@/components/progress-bar"
import { Award } from "lucide-react"
import type { TopicPerformance } from "../types"

interface TopicPerformanceCardProps {
  topics: TopicPerformance[]
}

export function TopicPerformanceCard({ topics }: TopicPerformanceCardProps) {
  if (topics.length === 0) return null

  return (
    <MobileCard className="space-y-4">
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" />
        Performance by Topic
      </h2>
      <div className="space-y-3">
        {topics.map((topic) => (
          <div key={topic.id} className="space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
              <span className="font-medium text-foreground line-clamp-1 flex-1">
                {topic.title}
              </span>
              <span className="text-muted-foreground whitespace-nowrap">
                {topic.averageScore}%
              </span>
            </div>
            <ProgressBar
              value={topic.averageScore}
              showPercentage={false}
              color={
                topic.averageScore >= 80
                  ? "success"
                  : topic.averageScore >= 60
                  ? "warning"
                  : "danger"
              }
            />
          </div>
        ))}
      </div>
    </MobileCard>
  )
}
