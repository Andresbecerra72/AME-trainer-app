import { getAdminStats, getQuestions, getReports } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileQuestion, AlertTriangle, GitMerge, Award, Settings, Megaphone, Edit, Shield, BarChart3, BookOpen, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"

export default async function AdminDashboard() {
const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/protected/dashboard")
  }
 
  const [stats, pendingQuestions, pendingReports] = await Promise.all([
    getAdminStats(),
    getQuestions({ status: "pending", limit: 5 }),
    getReports("pending"),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      <MobileHeader title="Admin Dashboard" showBack={false} />

      <div className="p-4 space-y-5">
        {/* Welcome Card con Role Badge */}
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Welcome back,</p>
                <p className="text-2xl font-bold mt-1 capitalize">{role.replace('_', ' ')}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-7 w-7" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid - Mejorado */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                  <FileQuestion className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingQuestions}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
                  <p className="text-xs text-muted-foreground">Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Needs Attention - Section destacada */}
        {(stats.pendingQuestions > 0 || stats.pendingReports > 0) && (
          <Card className="border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span>Needs Your Attention</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.pendingQuestions > 0 && (
                <Link href="/admin/pending">
                  <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4 hover:bg-white dark:hover:bg-black/20">
                    <span className="flex items-center gap-2 text-sm">
                      <FileQuestion className="h-4 w-4" />
                      Review Questions
                    </span>
                    <Badge variant="secondary" className="bg-orange-600 text-white hover:bg-orange-600">
                      {stats.pendingQuestions}
                    </Badge>
                  </Button>
                </Link>
              )}
              {stats.pendingReports > 0 && (
                <Link href="/admin/reports">
                  <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4 hover:bg-white dark:hover:bg-black/20">
                    <span className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Review Reports
                    </span>
                    <Badge variant="secondary" className="bg-red-600 text-white hover:bg-red-600">
                      {stats.pendingReports}
                    </Badge>
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Management */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="font-semibold text-base">Content Management</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/questions?status=all">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileQuestion className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Questions</p>
                    <p className="text-xs text-muted-foreground">Manage all</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            {role === "super_admin" && (
              <Link href="/admin/topics">
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Topics</p>
                      <p className="text-xs text-muted-foreground">Organize content</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
            <Link href="/admin/badges">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Badges</p>
                    <p className="text-xs text-muted-foreground">Rewards system</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/announcements">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Announcements</p>
                    <p className="text-xs text-muted-foreground">Communicate</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Moderation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-orange-600 rounded-full" />
            <h3 className="font-semibold text-base">Moderation</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/duplicates">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <GitMerge className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Duplicates</p>
                    <p className="text-xs text-muted-foreground">Review & merge</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/edit-suggestions">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <Edit className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Edit Suggestions</p>
                    <p className="text-xs text-muted-foreground">Approve changes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* System (Super Admin Only) */}
        {role === "super_admin" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full" />
              <h3 className="font-semibold text-base">System</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/admin/users">
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Users</p>
                      <p className="text-xs text-muted-foreground">Manage accounts</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/analytics">
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Analytics</p>
                      <p className="text-xs text-muted-foreground">Platform insights</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/settings" className="sm:col-span-2">
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">System Settings</p>
                      <p className="text-xs text-muted-foreground">Configuration & preferences</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity - Pending Questions Preview */}
        {pendingQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-green-600 rounded-full" />
                <h3 className="font-semibold text-base">Recent Submissions</h3>
              </div>
              <Link href="/admin/pending">
                <Button variant="link" size="sm" className="text-xs h-auto p-0">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {pendingQuestions.slice(0, 3).map((question) => (
                <Link key={question.id} href={`/admin/pending`}>
                  <Card className="hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 mb-1">{question.question_text}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>by {question.author?.full_name || "Anonymous"}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
