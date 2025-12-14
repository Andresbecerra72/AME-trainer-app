import { redirect } from "next/navigation"
import { getPendingReports } from "@/features/reports/services/reports.api"
import { MobileHeader } from "@/components/mobile-header"
import { CheckCircle, Flag } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { ReportCard } from "@/features/reports/components/ReportCard"
import { Card, CardContent } from "@/components/ui/card"

export default async function ReportsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/dashboard")
  }

  // Fetch pending reports (business logic moved to feature API)
  const reports = await getPendingReports()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Reports" showBack />

      {/* Stats Header */}
      {reports && reports.length > 0 && (
        <div className="p-4 pb-2">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-900/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-200 dark:border-orange-800">
                  <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {reports.length}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Pending Report{reports.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 space-y-4">
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-1">All Clear!</h3>
                <p className="text-sm text-muted-foreground">No pending reports to review</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
