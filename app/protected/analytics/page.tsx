import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { redirect } from "next/navigation"
import { getSession } from "@/features/auth/services/getSession"
import { getUserAnalytics } from "@/features/analytics/services/analytics.api"
import { OverallStatsCard } from "@/features/analytics/components/OverallStatsCard"
import { StudyTimeChart } from "@/features/analytics/components/StudyTimeChart"
import { TopicPerformanceCard } from "@/features/analytics/components/TopicPerformanceCard"
import { WeakAreasCard } from "@/features/analytics/components/WeakAreasCard"
import { StrongAreasCard } from "@/features/analytics/components/StrongAreasCard"
import { RecommendationsCard } from "@/features/analytics/components/RecommendationsCard"
import { EmptyAnalyticsState } from "@/features/analytics/components/EmptyAnalyticsState"
import { getUserUnreadNotifications } from "@/features/notifications/services/notifications.server"

export default async function AnalyticsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch analytics data
  const analyticsData = await getUserAnalytics(user.id)
  const { count: unreadNotifications } = await getUserUnreadNotifications(user.id)

  const hasData = analyticsData.topicPerformance.length > 0

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Progress Analytics" showBack />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* Overall Stats */}
        <OverallStatsCard stats={analyticsData.overallStats} />

        {/* Study Time Chart */}
        <StudyTimeChart data={analyticsData.studyTimeData} />

        {hasData ? (
          <>
            {/* Performance by Topic */}
            <TopicPerformanceCard topics={analyticsData.topicPerformance} />

            {/* Weak Areas */}
            <WeakAreasCard areas={analyticsData.weakAreas} />

            {/* Strong Areas */}
            <StrongAreasCard areas={analyticsData.strongAreas} />

            {/* Recommendations */}
            <RecommendationsCard weakAreas={analyticsData.weakAreas} />
          </>
        ) : (
          <EmptyAnalyticsState />
        )}
      </div>

      <BottomNav userRole={role} unreadNotifications={unreadNotifications || 0} />
    </div>
  )
}
