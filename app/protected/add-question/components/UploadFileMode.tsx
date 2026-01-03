"use client"

import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { Upload, FileText, Loader2 } from "lucide-react"
import { FileUploadStatusCard, FileImportReviewCard, PendingJobsCard } from "@/features/questions/import/components"
import { User } from "@/lib/types"
import { QuestionImportJob, DraftQuestion } from "@/features/questions/import/types"

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
  onFileUpload: (file: File) => Promise<void>
  onResumeJob: (job: any) => Promise<void>
  onDeleteJob: (job: any) => Promise<void>
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
  onFileUpload,
  onResumeJob,
  onDeleteJob,
  onSubmitFileImport,
}: UploadFileModeProps) {
  return (
    <div className="space-y-6">
      {/* Pending Jobs Card */}
      {!isPendingJobsLoading && pendingJobs.length > 0 && !job && (
        <PendingJobsCard 
          jobs={pendingJobs}
          onResumeJob={onResumeJob}
          onDeleteJob={onDeleteJob}
          isLoading={isPendingJobsLoading}
        />
      )}

      {/* Upload Area */}
      {(!job || job.status === "failed") && (
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
        </>
      )}

      {/* Status Card */}
      <FileUploadStatusCard 
        job={job} 
        isUploading={isUploading} 
        isExtracting={isExtracting}
        extractionProgress={extractionProgress}
        error={error} 
      />

      {/* Review Card */}
      {job?.status === "ready" && job.result && job.result.length > 0 && (
        <FileImportReviewCard
          questions={job.result}
          topics={topics}
          onSubmit={onSubmitFileImport}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
