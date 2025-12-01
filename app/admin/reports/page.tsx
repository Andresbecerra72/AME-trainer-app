import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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
import { markQuestionInconsistent } from "@/lib/db-actions"

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Fetch pending reports
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:users!reports_reported_by_fkey(id, full_name),
      question:questions(id, question_text, status)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

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

      <BottomNav userRole={profile.role} />
    </div>
  )
}

function ReportCard({ report }: { report: any }) {
  async function resolveReport(formData: FormData) {
    "use server"
    const reportId = formData.get("reportId") as string
    const action = formData.get("action") as string
    const supabase = await createClient()

    if (action === "resolved") {
      await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId)
    } else if (action === "dismissed") {
      await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId)
    }
  }

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
              <form
                action={async (formData: FormData) => {
                  "use server"
                  const notes = formData.get("notes") as string
                  await markQuestionInconsistent(report.question_id, notes)
                  await resolveReport(formData)
                }}
                className="space-y-4"
              >
                <input type="hidden" name="reportId" value={report.id} />
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
