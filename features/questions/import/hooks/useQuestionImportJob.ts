"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestionImportJob } from "../types"
import { getImportJob, uploadTextExtract } from "../server/questionImport.actions"
import { getSession } from "@/features/auth/services/getSession"
import { extractTextFromFile, validateExtractedText } from "../utils/textExtraction"
import { deleteImportJob } from "../server/deleteImportJob.actions"

export function useQuestionImportJob() {
  const [job, setJob] = useState<QuestionImportJob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const pollRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [])

  function stopPolling() {
    if (pollRef.current) window.clearInterval(pollRef.current)
    pollRef.current = null
  }

  function beginPolling(jobId: string) {
    stopPolling()
    setIsUploading(false)
    setExtractionProgress("")
    
    pollRef.current = window.setInterval(async () => {
      try {
        const latest = await getImportJob(jobId)
        setJob(latest)

        if (latest.status === "ready" || latest.status === "failed") {
          stopPolling()
        }
      } catch {
        // Ignore transient errors during polling
      }
    }, 1500)
  }

  async function startUpload(file: File) {
    resetState()
    setIsExtracting(true)
    setExtractionProgress("Preparing file...")

    try {
      const { user } = await getSession()
      if (!user?.id) throw new Error("Missing session user")

      // Extract text from file
      setExtractionProgress("Extracting text from file...")
      const extractionResult = await extractTextFromFile(file)

      // Validate extracted text
      setExtractionProgress("Validating extracted text...")
      const validation = validateExtractedText(extractionResult.text)
      
      if (!validation.isValid) {
        const errorMsg = `Text validation failed:\n${validation.issues.join('\n')}\n\nSuggestions:\n${validation.suggestions.join('\n')}`
        setError(errorMsg)
        setIsExtracting(false)
        return
      }

      // Upload to server
      setIsExtracting(false)
      setIsUploading(true)
      setExtractionProgress("Uploading to server...")
      
      const result = await uploadTextExtract({
        file,
        userId: user.id,
        rawText: extractionResult.text,
        rawPages: extractionResult.pages,
        extractionMethod: extractionResult.method,
      })
      
      setJob(result)
      setExtractionProgress("Processing questions...")
      beginPolling(result.id)
    } catch (e: any) {
      handleError(e)
    }
  }

  async function resumeJob(existingJob: QuestionImportJob) {
    setError(null)
    setJob(existingJob)
    
    // If job is ready, just set it as current
    if (existingJob.status === "ready") {
      return
    }
    
    // Start polling/processing if job is still in progress
    if (existingJob.status === "pending" || existingJob.status === "processing") {
      setExtractionProgress("Processing questions...")
      
      // Check if we need to trigger Edge Function processing
      const needsProcessing = 
        existingJob.status === "pending" || 
        (existingJob.status === "processing" && (existingJob.raw_text || existingJob.raw_pages))
      
      if (needsProcessing) {
        try {
          const { processImportJob } = await import("../server/questionImport.actions")
          
          // Fire and forget - let it process in background
          processImportJob(existingJob.id).catch(() => {
            // Timeout errors are expected, job will update via polling
          })
          
          setJob({ ...existingJob, status: "processing" })
        } catch {
          setError("Failed to resume processing")
          return
        }
      }
      
      beginPolling(existingJob.id)
    }
  }

  async function deleteJob(jobId: string): Promise<boolean> {
    try {
      stopPolling()
      await deleteImportJob(jobId)
      
      if (job?.id === jobId) {
        setJob(null)
      }
      
      return true
    } catch (e: any) {
      console.error("Failed to delete job:", e)
      return false
    }
  }

  function resetState() {
    setError(null)
    setIsExtracting(false)
    setIsUploading(false)
    setExtractionProgress("")
  }

  function handleError(e: any) {
    console.error("Upload error:", e)
    setError(e?.message ?? "Upload failed")
    setIsExtracting(false)
    setIsUploading(false)
  }

  return {
    job,
    isUploading,
    isExtracting,
    extractionProgress,
    error,
    startUpload,
    resumeJob,
    deleteJob,
  }
}
