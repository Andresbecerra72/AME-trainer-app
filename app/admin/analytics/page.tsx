import { getCurrentUser, getPlatformAnalytics } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileQuestion, CheckCircle, Clock, XCircle, AlertTriangle, MessageSquare, Trophy } from "lucide-react"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import Link from "next/link"
import { getSession } from "@/features/auth/services/getSession"

export default async function PlatformAnalyticsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || role !== "super_admin") {
    redirect("/protected/dashboard")
  }
  
  const analytics = await getPlatformAnalytics()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Platform Analytics" showBack />

      <div className="p-4 space-y-6">
        {/* Overall Stats */}
        <div className="space-y-3">
          <h3 className="font-semibold">Platform Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Total Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.totalQuestions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Total Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.totalComments}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Community Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.totalExams}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Question Status Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold">Question Status</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-green-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{analytics.approvedQuestions}</p>
                <p className="text-xs text-muted-foreground">
                  {((analytics.approvedQuestions / analytics.totalQuestions) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                  <Clock className="h-4 w-4" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{analytics.pendingQuestions}</p>
                <p className="text-xs text-muted-foreground">
                  {((analytics.pendingQuestions / analytics.totalQuestions) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{analytics.rejectedQuestions}</p>
                <p className="text-xs text-muted-foreground">
                  {((analytics.rejectedQuestions / analytics.totalQuestions) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Inconsistent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">{analytics.inconsistentQuestions}</p>
                <Link href="/admin/duplicates" className="text-xs text-primary hover:underline">
                  Review ?
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="space-y-3">
          <h3 className="font-semibold">Top Contributors</h3>
          <Card>
            <CardContent className="p-4 space-y-2">
              {analytics.topContributors.map((user: any, index: number) => (
                <Link key={user.id} href={`/protected/profile/${user.id}`}>
                  <div className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.reputation}</p>
                      <p className="text-xs text-muted-foreground">reputation</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Questions by Topic */}
        <div className="space-y-3">
          <h3 className="font-semibold">Questions by Topic</h3>
          <Card>
            <CardContent className="p-4 space-y-2">
              {Object.entries(analytics.questionsByTopic)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between p-2">
                    <p className="font-medium">{topic}</p>
                    <p className="text-sm text-muted-foreground">{count} questions</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
