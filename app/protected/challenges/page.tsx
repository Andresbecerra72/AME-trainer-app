import { MobileHeader } from "@/components/mobile-header"
import { Trophy } from "lucide-react"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { getSession } from "@/features/auth/services/getSession"
import { getChallengePageData } from "@/features/challenges/services/challenges.api"
import { ChallengeCard } from "@/features/challenges/components/ChallengeCard"
import { LeaderboardCard } from "@/features/challenges/components/LeaderboardCard"
import { getUserUnreadNotifications } from "@/features/notifications/services/notifications.server"

export default async function ChallengesPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch all challenge data
  const { challenge, leaderboard, userAttempt } = await getChallengePageData(user.id)
  const { count: unreadNotifications } = await getUserUnreadNotifications(user.id)

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Weekly Challenge" showBack />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {!challenge ? (
          <EmptyState
            icon={Trophy}
            title="No active challenge"
            description="Check back soon for the next weekly challenge!"
          />
        ) : (
          <>
            <ChallengeCard
              challenge={challenge}
              leaderboardCount={leaderboard.length}
              userAttempt={userAttempt}
            />

            <LeaderboardCard attempts={leaderboard} />
          </>
        )}
      </div>

      <BottomNav userRole={role} unreadNotifications={unreadNotifications || 0} />
    </div>
  )
}
