"use client"

import { useEffect, useRef, useState } from "react"
import { pollImportJobStatus } from "../server/questionImport.actions"
import type { ImportProgress } from "../components/ImportProgressBar"

interface UseImportProgressOptions {
  jobId: string | null
  onComplete?: (questionsExtracted: number) => void
  onError?: (error: string) => void
  pollingInterval?: number
}

export function useImportProgress({
  jobId,
  onComplete,
  onError,
  pollingInterval = 2000,
}: UseImportProgressOptions) {
  const [progress, setProgress] = useState<ImportProgress>({
    status: "idle",
  })

  const pollRef = useRef<number | null>(null)
  const lastStatusRef = useRef<string>("")
  const warningsRef = useRef<Set<string>>(new Set())

  // Stop polling
  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // Start polling
  const startPolling = (id: string) => {
    stopPolling()
    warningsRef.current.clear()

    pollRef.current = window.setInterval(async () => {
      try {
        const result = await pollImportJobStatus(id)

        // Detect warnings (e.g., pages timing out but job continues)
        const warnings: string[] = []
        if (result.progress && result.questionsExtracted === 0 && result.progress.current > 0) {
          const warningMsg = `${result.progress.current} page(s) processed but no questions extracted yet. OpenAI may be timing out.`
          if (!warningsRef.current.has(warningMsg)) {
            warnings.push(warningMsg)
            warningsRef.current.add(warningMsg)
          }
        }

        setProgress({
          status: result.done 
            ? result.status === "failed" ? "failed" : "ready"
            : "processing",
          currentPage: result.progress?.current,
          totalPages: result.progress?.total,
          questionsExtracted: result.questionsExtracted,
          percentage: result.progress?.percentage,
          error: result.error || undefined,
          warnings: warnings.length > 0 ? Array.from(warningsRef.current) : undefined,
        })

        // Handle completion
        if (result.done) {
          stopPolling()

          if (result.status === "ready" && onComplete) {
            onComplete(result.questionsExtracted || 0)
          } else if (result.status === "failed" && onError) {
            onError(result.error || "Import failed")
          }
        }

        lastStatusRef.current = result.status
      } catch (error) {
        console.error("Polling error:", error)
        // Don't stop polling on transient errors
      }
    }, pollingInterval)
  }

  // Effect to start/stop polling based on jobId
  useEffect(() => {
    if (jobId) {
      setProgress({ status: "processing" })
      startPolling(jobId)
    } else {
      stopPolling()
      setProgress({ status: "idle" })
    }

    return () => stopPolling()
  }, [jobId])

  return {
    progress,
    stopPolling,
    restartPolling: () => jobId && startPolling(jobId),
  }
}
