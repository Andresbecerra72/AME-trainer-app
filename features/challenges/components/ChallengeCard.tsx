"use client"

import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { Trophy, Clock, Users, Calendar } from "lucide-react"
import Link from "next/link"
import type { Challenge, ChallengeAttempt } from "../types"

interface ChallengeCardProps {
  challenge: Challenge
  leaderboardCount: number
  userAttempt: ChallengeAttempt | null
}

interface ChallengeCompletedBannerProps {
  attempt: ChallengeAttempt
}

function ChallengeCompletedBanner({ attempt }: ChallengeCompletedBannerProps) {
  return (
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
            Challenge Completed!
          </p>
          <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
            Your score: {attempt.score}/{attempt.total_questions}
          </p>
        </div>
        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function ChallengeCard({ challenge, leaderboardCount, userAttempt }: ChallengeCardProps) {
  return (
    <MobileCard className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground line-clamp-2">
              {challenge.title}
            </h2>
            {challenge.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-3">
                {challenge.description}
              </p>
            )}
          </div>
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Questions
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {challenge.question_count}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Participants
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {leaderboardCount}
            </div>
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Ends {formatDate(challenge.end_date)}</span>
        </div>

        {/* Action or Completion Banner */}
        {userAttempt ? (
          <ChallengeCompletedBanner attempt={userAttempt} />
        ) : (
          <Link href={`/challenges/${challenge.id}/take`}>
            <PrimaryButton className="w-full">Start Challenge</PrimaryButton>
          </Link>
        )}
      </div>
    </MobileCard>
  )
}
