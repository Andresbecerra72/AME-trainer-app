"use client"

import { AlertCircle, CheckCircle, Eye, Flag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { resolveReport, markInconsistentAndResolve } from "@/features/reports/services/reports.api"
import Link from "next/link"

interface ReportCardProps {
  report: {
    id: string
    reason: string
    description: string | null
    created_at: string
    question_id: string
    reporter?: {
      full_name: string | null
      avatar_url: string | null
    } | null
    question?: {
      question_text: string
      option_a: string
      option_b: string
      option_c: string
      option_d: string
      correct_answer: "A" | "B" | "C" | "D"
    } | null
  }
}

const reasonColors = {
  spam: "bg-rose-500/10 text-rose-600 border-rose-200",
  inappropriate: "bg-rose-500/10 text-rose-600 border-rose-200",
  incorrect: "bg-amber-500/10 text-amber-600 border-amber-200",
  duplicate: "bg-blue-500/10 text-blue-600 border-blue-200",
  other: "bg-slate-500/10 text-slate-600 border-slate-200",
}

export function ReportCard({ report }: ReportCardProps) {
  const reporterName = report.reporter?.full_name || "Anonymous"
  const reporterInitials = reporterName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const correctOption = report.question
    ? report.question[`option_${report.question.correct_answer.toLowerCase()}` as keyof typeof report.question] as string
    : null

  // Format date consistently for SSR
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  return (
    <div className="bg-card border border-orange-200 dark:border-orange-900/50 rounded-lg overflow-hidden shadow-sm">
      {/* Compact Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30 border-b border-orange-100 dark:border-orange-900/50">
        <Avatar className="h-7 w-7">
          <AvatarImage src={report.reporter?.avatar_url || ""} alt={reporterName} />
          <AvatarFallback className="text-[10px] bg-orange-100 dark:bg-orange-900/50">
            {reporterInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs font-medium text-foreground truncate">
            {reporterName}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatDate(report.created_at)}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`h-5 text-[10px] px-1.5 border ${reasonColors[report.reason as keyof typeof reasonColors] || reasonColors.other}`}
        >
          {report.reason}
        </Badge>
      </div>

      {/* Report Content */}
      <div className="p-3 space-y-3">
        {/* Report Description */}
        {report.description && (
          <div className="rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 p-2.5">
            <div className="flex items-start gap-2">
              <Flag className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">
                  Report Details
                </div>
                <div className="text-xs text-orange-900/80 dark:text-orange-100/80">
                  {report.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reported Question */}
        {report.question && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Reported Question:</div>
            <div className="rounded-lg bg-muted/50 border p-2.5">
              <p className="text-xs font-medium line-clamp-2 mb-2">
                {report.question.question_text}
              </p>
              {correctOption && (
                <div className="rounded border-l-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 pl-2 py-1">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        {correctOption}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          <Link href={`/community/questions/${report.question_id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View Question
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/30">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
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
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <form className="flex-1">
            <input type="hidden" name="reportId" value={report.id} />
            <input type="hidden" name="action" value="resolved" />
            <Button
              formAction={resolveReport}
              type="submit"
              size="sm"
              className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Resolve
            </Button>
          </form>
          <form className="flex-1">
            <input type="hidden" name="reportId" value={report.id} />
            <input type="hidden" name="action" value="dismissed" />
            <Button
              formAction={resolveReport}
              type="submit"
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs"
            >
              Dismiss
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
