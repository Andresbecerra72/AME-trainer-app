import { getAdminStats, getQuestions, getReports } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileQuestion, AlertTriangle, GitMerge, Award, Settings, Megaphone } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"

export default async function AdminDashboard() {
const { user, role } = await getSession()

  if (!user) {
    redirect("/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/dashboard")
  }
 
  const [stats, pendingQuestions, pendingReports] = await Promise.all([
    getAdminStats(),
    getQuestions({ status: "pending", limit: 5 }),
    getReports("pending"),
  ])

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Admin Dashboard" showBack={false} />

      <div className="p-4 space-y-6">
        {/* Role Badge */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 text-center">
          <p className="text-sm font-medium">Logged in as</p>
          <p className="text-2xl font-bold capitalize">{role}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalQuestions}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingQuestions}</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="grid gap-2">
            <Link href="/admin/questions">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileQuestion className="mr-2 h-4 w-4" />
                Manage Questions
              </Button>
            </Link>
            <Link href="/admin/pending">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileQuestion className="mr-2 h-4 w-4" />
                Review Questions ({stats.pendingQuestions})
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Review Reports ({stats.pendingReports})
              </Button>
            </Link>
            <Link href="/admin/duplicates">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <GitMerge className="mr-2 h-4 w-4" />
                Review Duplicates
              </Button>
            </Link>
            <Link href="/admin/edit-suggestions">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileQuestion className="mr-2 h-4 w-4" />
                Edit Suggestions
              </Button>
            </Link>
            <Link href="/admin/badges">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Award className="mr-2 h-4 w-4" />
                Manage Badges
              </Button>
            </Link>
            <Link href="/admin/announcements">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Megaphone className="mr-2 h-4 w-4" />
                Announcements
              </Button>
            </Link>
            {role === "super_admin" && (
              <>
                <Link href="/admin/topics">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileQuestion className="mr-2 h-4 w-4" />
                    Manage Topics
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    Platform Analytics
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Pending Questions Preview */}
        {pendingQuestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Pending Questions</h3>
            <div className="space-y-2">
              {pendingQuestions.map((question) => (
                <Link key={question.id} href={`/admin/pending`}>
                  <div className="bg-card border border-orange-200 dark:border-orange-900 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <p className="text-sm font-medium line-clamp-2 mb-1">{question.question_text}</p>
                    <p className="text-xs text-muted-foreground">by {question.author?.display_name || "Anonymous"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
