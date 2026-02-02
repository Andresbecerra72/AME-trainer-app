"use client"

import { MobileCard } from "@/components/mobile-card"
import { Loader2, FileText, Clock, AlertCircle, Trash2, CheckCircle } from "lucide-react"
import { QuestionImportJob } from "../types"
import { formatDistanceToNow } from "date-fns"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface PendingJobsCardProps {
  jobs: QuestionImportJob[]
  onResumeJob: (job: QuestionImportJob) => void
  onDeleteJob: (job: QuestionImportJob) => void
  isLoading?: boolean
}

export function PendingJobsCard({ jobs, onResumeJob, onDeleteJob, isLoading }: PendingJobsCardProps) {
  //console.log("PendingJobsCard render: ", jobs)
  const ITEMS_PER_PAGE = 5
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // Reset display count when jobs change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [jobs.length])

  // Load more function
  const loadMore = useCallback(() => {
    if (loadingRef.current || displayCount >= jobs.length) return
    
    loadingRef.current = true
    setIsLoadingMore(true)
    
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, jobs.length))
      setIsLoadingMore(false)
      loadingRef.current = false
    }, 300)
  }, [displayCount, jobs.length, ITEMS_PER_PAGE])

  // Infinite scroll observer
  useEffect(() => {
    const target = observerTarget.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [loadMore])

  const visibleJobs = jobs.slice(0, displayCount)

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
    <MobileCard className="p-4 sm:p-5 space-y-4 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 dark:from-blue-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-sm">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100">
            Resume Processing
          </h3>
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5 sm:mt-1">
            {jobs.length} import{jobs.length === 1 ? '' : 's'} in progress
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent">
        {visibleJobs.map((job, index) => (
          <div
            key={job.id}
            className={cn(
              "bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800",
              "shadow-sm hover:shadow-md transition-all duration-200",
              "animate-in fade-in slide-in-from-top-2"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {job.file_name || "Untitled"}
                  </p>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
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
                  className="text-xs h-8 px-3 flex-1 sm:flex-none sm:w-24 justify-center"
                >
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Delete</span>
                  <Trash2 className="w-3.5 h-3.5 sm:ml-1" />
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => onResumeJob(job)}
                  className="text-xs h-8 px-3 flex-1 sm:flex-none sm:w-24 justify-center"
                >
                  <span>Monitor</span>
                </PrimaryButton>
              </div>
            </div>
          </div>
        ))}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          </div>
        )}

        {/* Intersection observer target - always rendered */}
        <div ref={observerTarget} className="h-1 w-full" />
      </div>

      {/* Progress indicator */}
      {jobs.length > ITEMS_PER_PAGE && (
        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
          <div className="flex-1 h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(displayCount / jobs.length) * 100}%` }}
            />
          </div>
          <span className="font-medium whitespace-nowrap">
            {displayCount} / {jobs.length}
          </span>
        </div>
      )}

      <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2.5 sm:p-3">
        <strong>Tip:</strong> Click "Monitor" to check processing status or "Delete" to remove the imported questions.
      </div>
    </MobileCard>
  )
}
