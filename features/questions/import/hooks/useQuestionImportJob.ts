"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestionImportJob } from "../types"
import { getImportJob, uploadAndExtractPdf } from "../server/questionImport.actions"
import { getSession } from "@/features/auth/services/getSession"

export function useQuestionImportJob() {
  const [job, setJob] = useState<QuestionImportJob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pollRef = useRef<number | null>(null)

  function stopPolling() {
    if (pollRef.current) window.clearInterval(pollRef.current)
    pollRef.current = null
  }

  function beginPolling(jobId: string) {
    stopPolling()
    pollRef.current = window.setInterval(async () => {
      try {
        const latest = await getImportJob(jobId)
        console.log("Polling import job", latest)
        setJob(latest)

        if (latest.status === "ready" || latest.status === "failed") {
          stopPolling()
        }
      } catch {
        // ignore transient errors
      }
    }, 1500)
  }

  async function startUpload(file: File) {
    setError(null)
    setIsUploading(true)

    try {
      const { user } = await getSession()
      if (!user?.id) throw new Error("Missing session user")

      // Single Server Action handles everything:
      // 1. Creates job
      // 2. Uploads to Storage
      // 3. Extracts text from PDF (server-side)
      // 4. Triggers Edge Function to parse
      const result = await uploadAndExtractPdf(file, user.id)
      
      setJob(result)

      // Poll for final results
      beginPolling(result.id)
    } catch (e: any) {
      setError(e?.message ?? "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => () => stopPolling(), [])

  return { job, isUploading, error, startUpload }
}
