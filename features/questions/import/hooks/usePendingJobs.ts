"use client"

import { useEffect, useState } from "react"
import { QuestionImportJob } from "../types"
import { getPendingJobs } from "../server/getPendingJobs.actions"

/**
 * Hook to fetch and monitor pending import jobs
 * Useful for resuming monitoring of jobs that are still processing
 */
export function usePendingJobs() {
  const [pendingJobs, setPendingJobs] = useState<QuestionImportJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPendingJobs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const jobs = await getPendingJobs()
      setPendingJobs(jobs)
    } catch (err: any) {
      console.error("Failed to load pending jobs:", err)
      setError(err?.message || "Failed to load pending jobs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPendingJobs()
  }, [])

  return {
    pendingJobs,
    isLoading,
    error,
    refresh: loadPendingJobs,
  }
}
