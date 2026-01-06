"use client"

import { MobileCard } from "@/components/mobile-card"
import Link from "next/link"

export function EmptyAnalyticsState() {
  return (
    <MobileCard className="text-center py-6 sm:py-8">
      <p className="text-sm sm:text-base text-muted-foreground mb-4">
        No exam data yet. Take your first exam to see your analytics!
      </p>
      <Link
        href="/protected/exam/setup"
        className="inline-block px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm sm:text-base hover:bg-primary/90 transition-colors"
      >
        Start Exam
      </Link>
    </MobileCard>
  )
}
