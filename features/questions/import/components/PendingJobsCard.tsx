"use client"

import { MobileCard } from "@/components/mobile-card"
import { Loader2, FileText, Clock, AlertCircle, Trash2, CheckCircle } from "lucide-react"
import { QuestionImportJob } from "../types"
import { formatDistanceToNow } from "date-fns"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"

interface PendingJobsCardProps {
  jobs: QuestionImportJob[]
  onResumeJob: (job: QuestionImportJob) => void
  onDeleteJob: (job: QuestionImportJob) => void
  isLoading?: boolean
}

export function PendingJobsCard({ jobs, onResumeJob, onDeleteJob, isLoading }: PendingJobsCardProps) {
  if (isLoading) {
    return (
      <MobileCard className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p>Checking for pending imports...</p>
        </div>
      </MobileCard>
    )
  }

  if (jobs.length === 0) {
    return null
  }

  return (
    <MobileCard className="p-5 space-y-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Resume Processing
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            You have {jobs.length} import{jobs.length === 1 ? '' : 's'} in progress
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {job.file_name || "Untitled"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {job.status === "processing" ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Processing...
                        </span>
                      </>
                    ) : job.status === "ready" ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Ready to Review
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          Pending
                        </span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {job.stats?.page_count && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {job.stats.page_count} page{job.stats.page_count === 1 ? '' : 's'}
                      {job.stats.text_length && ` • ${Math.round(job.stats.text_length / 1000)}k chars`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <SecondaryButton
                  onClick={() => onDeleteJob(job)}
                  className="text-xs h-8 px-3"
                >{job.status === "ready" ? "Review" : "Monitor"}
                  <Trash2 className="w-3.5 h-3.5" />
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => onResumeJob(job)}
                  className="text-xs h-8 px-3"
                >
                  Monitor
                </PrimaryButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-md p-2">
        <strong>Tip:</strong> Click "Monitor" to check processing status or "Review" to verify and save parsed questions.
      </div>
    </MobileCard>
  )
}
