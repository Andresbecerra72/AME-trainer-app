import { redirect } from "next/navigation"
import { getPendingReports, resolveReport, markInconsistentAndResolve } from "@/features/reports/services/reports.api"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { AlertCircle, CheckCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getSession } from "@/features/auth/services/getSession"

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

      <div className="p-4 space-y-4">
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <MobileCard>
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">No pending reports</p>
            </div>
          </MobileCard>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}

function ReportCard({ report }: { report: any }) {
  const getReasonBadge = (reason: string) => {
    const variants: Record<string, any> = {
      spam: "destructive",
      inappropriate: "destructive",
      incorrect: "secondary",
      duplicate: "outline",
      other: "outline",
    }
    return variants[reason] || "outline"
  }

  return (
    <MobileCard>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <Badge variant={getReasonBadge(report.reason)}>{report.reason}</Badge>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {new Date(report.created_at).toLocaleDateString()}
          </span>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Report details:</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.description || "No description provided"}
          </p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Reported question:</p>
          <p className="text-sm line-clamp-2">{report.question?.question_text}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/community/questions/${report.question_id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <Eye className="w-4 h-4 mr-2" />
              View Question
            </Button>
          </Link>
        </div>

        <form className="flex gap-2">
          <input type="hidden" name="reportId" value={report.id} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 bg-transparent">
                <AlertCircle className="w-4 h-4 mr-2" />
                Mark Inconsistent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Question as Inconsistent</DialogTitle>
                <DialogDescription>
                  This will flag the question for review and warn users about potential issues.
                </DialogDescription>
              </DialogHeader>
              <form action={markInconsistentAndResolve} className="space-y-4">
                <input type="hidden" name="reportId" value={report.id} />
                <input type="hidden" name="questionId" value={report.question_id} />
                <input type="hidden" name="action" value="resolved" />
                <div className="space-y-2">
                  <Label htmlFor="notes">Inconsistency Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Explain why this question is inconsistent..."
                    rows={3}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Mark as Inconsistent
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button formAction={resolveReport} name="action" value="resolved" className="flex-1" variant="default">
            Resolve
          </Button>
          <Button
            formAction={resolveReport}
            name="action"
            value="dismissed"
            className="flex-1 bg-transparent"
            variant="outline"
          >
            Dismiss
          </Button>
        </form>
      </div>
    </MobileCard>
  )
}
