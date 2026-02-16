"use client"

import { useState } from "react"
import { MobileCard } from "@/components/mobile-card"
import { SecondaryButton } from "@/components/secondary-button"
import { FileText, Loader2, Bell, XCircle, ArrowLeft } from "lucide-react"
import { FileImportReviewCard, PendingJobsCard, ImportProgressBar, type ImportProgress, QuestionImportForm, ExtractionProgressData } from "@/features/questions/import/components"
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
import { QuestionsProgressDetails } from "@/features/questions/import/hooks/useQuestionImportJob"

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
  extractionDetails: ExtractionProgressData | null
  progressDetails?: QuestionsProgressDetails | null
  onFileUpload: (file: File) => Promise<void>
  onResumeJob: (job: any) => Promise<void>
  onDeleteJob: (job: any) => Promise<boolean>
  onResetStateJob: () => void
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
  pendingJobs,
  isPendingJobsLoading,
  topics,
  isSubmitting,
  progressDetails,
  onFileUpload,
  onResumeJob,
  onDeleteJob,
  onSubmitFileImport,
  extractionDetails,
  onResetStateJob,
  error
}: UploadFileModeProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [jobToCancel, setJobToCancel] = useState<QuestionImportJob | null>(null)
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
  const progress = getImportProgress()

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

    // Show progress if there's a job OR if there's extraction/upload activity OR if there's an error
  const showProgress = (job && (isUploading || isExtracting || job.status === "processing" || job.status === "ready" || job.status === "failed")) || 
                       (!job && (isUploading || isExtracting || error))
  // Can upload if: no job, or job failed/completed, or there's an error without a job
  const canUploadNew = !job || job.status === "failed" || job.status === "completed" || (!job && error && !isExtracting && !isUploading)
  const hasActiveJob = job && (job.status === "processing" || job.status === "ready")

  return (
    <div className="space-y-6 mb-16">
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
        <>
        {job.status === "ready" && (<SecondaryButton
          onClick={onResetStateJob}
          className="flex-shrink-0 gap-2 h-10 text-sm px-24 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </SecondaryButton>)}
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">          
            <AlertDescription className="flex items-center justify-between gap-4">
              <div className="flex-1 text-sm text-amber-700 dark:text-amber-300">
                <strong>File in progress:</strong> {job.file_name || "Untitled"}
                {job.status === "ready" && " (ready for review)"}
                {job.status === "processing" && " (extracting questions)"}
              </div>
              { job.status !== "ready" && (<SecondaryButton
                onClick={handleCancelJob}
                className="flex-shrink-0 gap-2 h-10 text-sm px-4"
              >
                <XCircle className="w-4 h-4" />
                Cancel & Upload New
              </SecondaryButton>)}

            </AlertDescription>
          </Alert></>
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

           {/* Import Form */}
           <QuestionImportForm 
              user={user}
              job={job}
              isUploading={isUploading}
              isExtracting={isExtracting}
              extractionProgress={extractionProgress}
              extractionDetails={extractionDetails}
              progressDetails={progressDetails}
              onFileUpload={onFileUpload}
              error={error}
            />
          

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
