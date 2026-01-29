"use client"

import { useState } from "react"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { Upload, FileText, Loader2, Bell, XCircle, AlertCircle } from "lucide-react"
import { FileImportReviewCard, PendingJobsCard, ImportProgressBar, type ImportProgress } from "@/features/questions/import/components"
import { useImportNotifications } from "@/features/questions/import/hooks/useImportNotifications"
import { User } from "@/lib/types"
import { QuestionImportJob, DraftQuestion } from "@/features/questions/import/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UploadFileModeProps {
  user: User | undefined
  job: QuestionImportJob | null
  isUploading: boolean
  isExtracting: boolean
  extractionProgress: string
  error: string | null
  pendingJobs: QuestionImportJob[]
  isPendingJobsLoading: boolean
  topics: any[]
  isSubmitting: boolean
  progressDetails?: {
    currentPage?: number
    totalPages?: number
    questionsExtracted?: number
    percentage?: number
    warnings?: string[]
  } | null
  onFileUpload: (file: File) => Promise<void>
  onResumeJob: (job: any) => Promise<void>
  onDeleteJob: (job: any) => Promise<boolean>
  onSubmitFileImport: (payload: {
    topic_id: string
    difficulty: "easy" | "medium" | "hard"
    questions: DraftQuestion[]
  }) => Promise<void>
}

export function UploadFileMode({
  user,
  job,
  isUploading,
  isExtracting,
  extractionProgress,
  error,
  pendingJobs,
  isPendingJobsLoading,
  topics,
  isSubmitting,
  progressDetails,
  onFileUpload,
  onResumeJob,
  onDeleteJob,
  onSubmitFileImport,
}: UploadFileModeProps) {
  // Setup notifications
  useImportNotifications({
    jobId: job?.id || null,
    enabled: !!job && (job.status === "processing" || job.status === "pending"),
  })

  // Build progress object for ImportProgressBar
  const getImportProgress = (): ImportProgress | null => {
    // Handle validation errors without a job
    if (!job && error && !isExtracting && !isUploading) {
      return {
        status: "failed",
        error: error,
        questionsExtracted: 0,
      }
    }

    if (!job) return null

    // Map job status to ImportProgress status
    let status: ImportProgress["status"] = "idle"
    if (isExtracting) status = "extracting"
    else if (isUploading) status = "uploading"
    else if (job.status === "processing") status = "processing"
    else if (job.status === "ready") status = "ready"
    else if (job.status === "failed") status = "failed"

    // Build message
    let message: string | undefined
    if (isExtracting || isUploading) {
      message = extractionProgress
    }

    return {
      status,
      currentPage: progressDetails?.currentPage,
      totalPages: progressDetails?.totalPages,
      questionsExtracted: progressDetails?.questionsExtracted || job.result?.length || 0,
      percentage: progressDetails?.percentage,
      error: error || job.error || undefined,
      warnings: progressDetails?.warnings,
      message,
    }
  }

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [jobToCancel, setJobToCancel] = useState<QuestionImportJob | null>(null)

  const progress = getImportProgress()
  // Show progress if there's a job OR if there's extraction/upload activity OR if there's an error
  const showProgress = (job && (isUploading || isExtracting || job.status === "processing" || job.status === "ready" || job.status === "failed")) || 
                       (!job && (isUploading || isExtracting || error))
  // Can upload if: no job, or job failed/completed, or there's an error without a job
  const canUploadNew = !job || job.status === "failed" || job.status === "completed" || (!job && error && !isExtracting && !isUploading)
  const hasActiveJob = job && (job.status === "processing" || job.status === "ready")

  const handleCancelJob = () => {
    if (!job) return
    setJobToCancel(job)
    setShowCancelDialog(true)
  }

  const confirmCancelJob = async () => {
    if (!jobToCancel) return
    
    const success = await onDeleteJob(jobToCancel)
    // Force re-render by resetting the file input
    if (success) {
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
    
    setShowCancelDialog(false)
    setJobToCancel(null)
  }

  return (
    <div className="space-y-6">
      {/* Notification Permission Alert */}
      {typeof window !== "undefined" && "Notification" in window && Notification.permission === "default" && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
            Enable browser notifications to get updates when your import completes, even if you leave this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Jobs Card */}
      {!isPendingJobsLoading && pendingJobs.length > 0 && !job && (
        <PendingJobsCard 
          jobs={pendingJobs}
          onResumeJob={onResumeJob}
          onDeleteJob={onDeleteJob}
          isLoading={isPendingJobsLoading}
        />
      )}

      {/* Active Job Warning - Allow Cancel */}
      {hasActiveJob && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <div className="flex-1 text-sm text-amber-700 dark:text-amber-300">
              <strong>File in progress:</strong> {job.file_name || "Untitled"}
              {job.status === "ready" && " (ready for review)"}
              {job.status === "processing" && " (extracting questions)"}
            </div>
            <SecondaryButton
              onClick={handleCancelJob}
              className="flex-shrink-0 gap-2 h-10 text-sm px-4"
            >
              <XCircle className="w-4 h-4" />
              Cancel & Upload New
            </SecondaryButton>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      {canUploadNew && (
        <>
          {!user?.id && (
            <MobileCard className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 mb-4">
              <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Loading user session...</p>
              </div>
            </MobileCard>
          )}
          
          <MobileCard className="border-dashed border-2 p-12 text-center space-y-6 hover:border-primary/50 transition-colors">
            <div className="flex justify-center">
              <div className="p-6 bg-primary/10 rounded-2xl">
                <Upload className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">Upload Question File</p>
              <p className="text-base text-muted-foreground">PDF or image files supported</p>
            </div>
            <input 
              type="file" 
              accept="application/pdf,image/*" 
              className="hidden" 
              id="file-upload"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFileUpload(file)
                e.target.value = ''
              }}
              disabled={!user?.id || isUploading || isExtracting}
            />
            <label htmlFor="file-upload">
              <PrimaryButton 
                type="button" 
                onClick={() => document.getElementById("file-upload")?.click()} 
                className="h-12 px-8 text-base"
                disabled={!user?.id || isUploading || isExtracting}
              >
                {isExtracting ? "Extracting..." : isUploading ? "Uploading..." : "Choose File"}
              </PrimaryButton>
            </label>
          </MobileCard>

       {!showProgress && (
          <MobileCard className="bg-muted/30 p-6">
            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-primary flex-shrink-0" />
              <div className="text-base text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload your PDF or image file</li>
                  <li>Text extraction happens in your browser (fast & private)</li>
                  <li>AI parses questions from the extracted text</li>
                  <li>Review and edit before submitting</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  <strong>Supported formats:</strong> PDF (text-based), JPG, PNG
                </p>
              </div>
            </div>
          </MobileCard> 
       )}
        </>
      )}

      {/* Progress Bar - NEW */}
      {showProgress && progress && (
        <ImportProgressBar progress={progress} />
      )}

      {/* Review Card */}
      {job?.status === "ready" && job.result && job.result.length > 0 && (
        <FileImportReviewCard
          questions={job.result}
          topics={topics}
          onSubmit={onSubmitFileImport}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Import?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{jobToCancel?.file_name || "this file"}"? 
              All extracted data will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Working</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelJob}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
