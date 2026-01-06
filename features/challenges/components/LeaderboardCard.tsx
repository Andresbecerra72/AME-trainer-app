"use client"

import { MobileCard } from "@/components/mobile-card"
import { Trophy } from "lucide-react"
import type { ChallengeAttempt } from "../types"

interface LeaderboardCardProps {
  attempts: ChallengeAttempt[]
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

function getRankColor(index: number): string {
  switch (index) {
    case 0:
      return "text-yellow-600"
    case 1:
      return "text-gray-500"
    case 2:
      return "text-amber-700"
    default:
      return "text-muted-foreground"
  }
}

export function LeaderboardCard({ attempts }: LeaderboardCardProps) {
  return (
    <MobileCard>
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        Leaderboard
      </h3>
      {attempts.length === 0 ? (
        <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">
          No attempts yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {attempts.map((attempt, index) => (
            <div
              key={attempt.id}
              className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-muted/50"
            >
              {/* Rank */}
              <div className={`text-base sm:text-lg font-bold ${getRankColor(index)} whitespace-nowrap`}>
                #{index + 1}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-xs sm:text-sm">
                  {attempt.user?.display_name || "Anonymous"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {attempt.score}/{attempt.total_questions} • {formatTime(attempt.time_taken)}
                </p>
              </div>

              {/* Percentage */}
              <div className="text-base sm:text-lg font-bold text-foreground whitespace-nowrap">
                {Math.round((attempt.score / attempt.total_questions) * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </MobileCard>
  )
}
