"use client"

import { FileSearch, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ExtractionProgressData {
  currentPage: number
  totalPages: number
  percentage: number
  method: 'pdf' | 'ocr'
  message: string
}

interface ExtractionProgressBarProps {
  progress: ExtractionProgressData
  className?: string
}

export function ExtractionProgressBar({ progress, className }: ExtractionProgressBarProps) {
  const { currentPage, totalPages, percentage, method, message } = progress
  
  const getMethodInfo = () => {
    if (method === 'pdf') {
      return {
        icon: <FileText className="h-5 w-5 text-blue-600" />,
        label: 'PDF Text Extraction',
        color: 'bg-blue-500'
      }
    }
    return {
      icon: <FileSearch className="h-5 w-5 text-purple-600" />,
      label: 'OCR Text Recognition',
      color: 'bg-purple-500'
    }
  }

  const methodInfo = getMethodInfo()

  return (
    <div className={cn("space-y-3 rounded-lg border bg-card p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{methodInfo.label}</p>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            methodInfo.color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Page Counter */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {methodInfo.icon}
            <span className="font-medium">Page Progress:</span>
            <span>{currentPage} / {totalPages}</span>
          </div>
          {method === 'ocr' && (
            <span className="text-xs text-orange-600">
              🔍 OCR may take longer for large documents
            </span>
          )}
        </div>
      )}

      {/* Method Badge */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
          method === 'pdf' 
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
        )}>
          {method === 'pdf' ? (
            <>
              <FileText className="h-3 w-3" />
              <span>PDF Text</span>
            </>
          ) : (
            <>
              <FileSearch className="h-3 w-3" />
              <span>OCR Scanning</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
