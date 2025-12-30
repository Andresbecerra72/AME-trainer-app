"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestionImportJob } from "../types"
import { triggerParseImportJob } from "../services/questionImport.api"
import { getImportJob, createImportJob, processImportJob, updateImportJobPath, uploadImportFile } from "../server/questionImport.actions" // Phase 1

export function useQuestionImportJob(userId: string | null) {
  const [job, setJob] = useState<QuestionImportJob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pollRef = useRef<number | null>(null)

  async function startUpload(file: File) {
    if (!userId) {
      setError("Missing user session. Please refresh the page and try again.")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create job with a temporary placeholder path, updated after upload
      const created = await createImportJob({
        userId,
        filePath: "pending",
        fileName: file.name,
        fileMime: file.type,
      })

      // Upload file to Storage
      const { path } = await uploadImportFile({ userId, file, jobId: created.id })

      // Update job with real path
      // (Use client update since job belongs to user)
      // You can add updateImportJob() in api if you want; inline here for simplicity.

      await updateImportJobPath(path, created.id)


      const refreshed = await getImportJob(created.id)
      setJob(refreshed)

      // Phase 1: call server action to process (PDF only)
      await processImportJob(created.id)      

      await triggerParseImportJob(created.id)

      // Poll until ready/failed (in case processing async)
      beginPolling(created.id)
    } catch (e: any) {
      setError(e?.message ?? "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  function beginPolling(jobId: string) {
    stopPolling()
    pollRef.current = window.setInterval(async () => {
      try {
        const latest = await getImportJob(jobId)
        setJob(latest)

        if (latest.status === "ready" || latest.status === "failed") {
          stopPolling()
        }
      } catch {
        // ignore transient poll failures
      }
    }, 1500)
  }

  function stopPolling() {
    if (pollRef.current) window.clearInterval(pollRef.current)
    pollRef.current = null
  }

  useEffect(() => () => stopPolling(), [])

  return { job, isUploading, error, startUpload }
}
