"use client"

import { MobileCard } from "@/components/mobile-card"
import { Loader2, CheckCircle2, XCircle, FileText, AlertCircle } from "lucide-react"
import type { QuestionImportJob } from "../types"

type Props = {
  job: QuestionImportJob | null
  isUploading: boolean
  isExtracting?: boolean
  extractionProgress?: string
  error: string | null
}

export function FileUploadStatusCard({ job, isUploading, isExtracting, extractionProgress, error }: Props) {
  if (!job && !isUploading && !isExtracting && !error) return null

  // Extracting text on client side
  if (isExtracting) {
    return (
      <MobileCard className="p-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <Loader2 className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-spin flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-purple-900 dark:text-purple-100">Extracting text from file...</p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {extractionProgress || "Reading document content..."}
            </p>
            <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-600 dark:bg-purple-400 h-full w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </MobileCard>
    )
  }

  // Uploading state
  if (isUploading) {
    return (
      <MobileCard className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-blue-900 dark:text-blue-100">Uploading to server...</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {extractionProgress || "Sending extracted text for processing..."}
            </p>
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 dark:bg-blue-400 h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </MobileCard>
    )
  }

  // Error state
  if (error || job?.status === "failed") {
    return (
      <MobileCard className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-4">
          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-red-900 dark:text-red-100">Processing Failed</p>
            <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
              {error || job?.error || "An error occurred while processing your file."}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Please try again or contact support if the problem persists.
            </p>
          </div>
        </div>
      </MobileCard>
    )
  }

  // Processing state
  if (job?.status === "processing" || job?.status === "pending") {
    return (
      <MobileCard className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-4">
          <Loader2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400 animate-spin flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">Parsing questions...</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Using AI to extract questions from the document text.
            </p>
            {job.file_name && (
              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                <FileText className="w-4 h-4" />
                <span className="truncate">{job.file_name}</span>
              </div>
            )}
          </div>
        </div>
      </MobileCard>
    )
  }

  // Ready state
  if (job?.status === "ready") {
    const questionCount = job.result?.length ?? 0
    
    return (
      <MobileCard className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-green-900 dark:text-green-100">File processed successfully!</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Found <span className="font-bold">{questionCount}</span> question{questionCount !== 1 ? 's' : ''} in your document.
            </p>
            {job.file_name && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <FileText className="w-4 h-4" />
                <span className="truncate">{job.file_name}</span>
              </div>
            )}
            {questionCount === 0 && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  No questions were detected. Please ensure your file follows the expected format.
                </p>
              </div>
            )}
          </div>
        </div>
      </MobileCard>
    )
  }

  return null
}
