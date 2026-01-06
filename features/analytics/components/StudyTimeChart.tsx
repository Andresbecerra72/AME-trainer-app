"use client"

import { MobileCard } from "@/components/mobile-card"
import { Clock } from "lucide-react"
import type { StudyTimeData } from "../types"

interface StudyTimeChartProps {
  data: StudyTimeData[]
}

export function StudyTimeChart({ data }: StudyTimeChartProps) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1)
  const totalHours = data.reduce((acc, d) => acc + d.hours, 0)

  return (
    <MobileCard className="space-y-4">
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Study Time Last 7 Days
      </h2>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.day} className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-10 text-xs sm:text-sm font-medium text-muted-foreground">
              {item.day}
            </div>
            <div className="flex-1 relative h-7 sm:h-8 bg-muted rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-lg flex items-center justify-end pr-1.5 sm:pr-2 transition-all"
                style={{ width: `${(item.hours / maxHours) * 100}%` }}
              >
                {item.hours > 0 && (
                  <span className="text-xs font-medium text-primary-foreground">
                    {item.hours}h
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-border text-xs sm:text-sm text-muted-foreground">
        Total: {totalHours.toFixed(1)}h last 7 days
      </div>
    </MobileCard>
  )
}
