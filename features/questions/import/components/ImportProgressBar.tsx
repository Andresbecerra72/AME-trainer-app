"use client"

import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ImportProgress {
  status: "idle" | "extracting" | "uploading" | "processing" | "ready" | "failed"
  currentPage?: number
  totalPages?: number
  questionsExtracted?: number
  percentage?: number
  error?: string
  warnings?: string[]
  message?: string
}

interface ImportProgressBarProps {
  progress: ImportProgress
  className?: string
}

export function ImportProgressBar({ progress, className }: ImportProgressBarProps) {
  const { status, currentPage, totalPages, questionsExtracted, percentage, error, warnings, message } = progress

  const getStatusColor = () => {
    switch (status) {
      case "ready":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "processing":
        return "bg-blue-500"
      case "uploading":
      case "extracting":
        return "bg-yellow-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "ready":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "processing":
      case "uploading":
      case "extracting":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    if (message) return message
    
    switch (status) {
      case "extracting":
        return "Extracting text from file..."
      case "uploading":
        return "Uploading to server..."
      case "processing":
        if (currentPage && totalPages) {
          return `Processing page ${currentPage} of ${totalPages}`
        }
        return "Processing questions..."
      case "ready":
        return `Import completed! ${questionsExtracted || 0} questions extracted`
      case "failed":
        return error || "Import failed"
      default:
        return "Waiting to start..."
    }
  }

  const displayPercentage = percentage ?? (currentPage && totalPages ? Math.round((currentPage / totalPages) * 100) : 0)

  return (
    <div className={cn("space-y-3 rounded-lg border bg-card p-4", className)}>
      {/* Status Header */}
     {status !== "failed" && (
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        {status !== "idle" && status !== "ready" && (
          <span className="text-sm font-semibold text-muted-foreground">
            {displayPercentage}%
          </span>
        )}
      </div>
     )}

      {/* Progress Bar */}
      {status !== "idle" && status !== "ready" && status !== "failed" && (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              getStatusColor()
            )}
            style={{ width: `${displayPercentage}%` }}
          />
        </div>
      )}

      {/* Details */}
      {!error && status === "processing" && (
        (currentPage || questionsExtracted) && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {currentPage && totalPages && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Pages:</span>
              <span>{currentPage}/{totalPages}</span>
            </div>
          )}
          {questionsExtracted !== undefined && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Questions:</span>
              <span className={cn(
                questionsExtracted > 0 ? "text-green-600 font-semibold" : ""
              )}>
                {questionsExtracted}
              </span>
            </div>
          )}
        </div>
      )
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((warning, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded bg-yellow-50 p-2 text-xs text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && status === "failed" && (
        <div className="space-y-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-red-900 dark:text-red-100">Import Failed</p>
              <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">{error}</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                Try uploading a different file or check that your PDF contains readable text.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
