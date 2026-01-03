"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestionImportJob } from "../types"
import { getImportJob, uploadTextExtract } from "../server/questionImport.actions"
import { getSession } from "@/features/auth/services/getSession"
import { extractTextFromFile, validateExtractedText } from "../utils/textExtraction"

export function useQuestionImportJob() {
  const [job, setJob] = useState<QuestionImportJob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const pollRef = useRef<number | null>(null)

  function stopPolling() {
    if (pollRef.current) window.clearInterval(pollRef.current)
    pollRef.current = null
  }

  function beginPolling(jobId: string) {
    stopPolling()
    // Clear uploading state and start polling
    setIsUploading(false)
    setExtractionProgress("")
    
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
    setIsExtracting(true)
    setExtractionProgress("Preparing file...")

    try {
      const { user } = await getSession()
      if (!user?.id) throw new Error("Missing session user")

      // Step 1: Extract text from file on client side
      setExtractionProgress("Extracting text from file...")
      console.log("Starting client-side text extraction for:", file.name)
      
      const extractionResult = await extractTextFromFile(file)
      
      console.log(`Text extracted via ${extractionResult.method}:`, {
        length: extractionResult.text.length,
        preview: extractionResult.text.substring(0, 200)
      })

      // Step 2: Validate extracted text
      setExtractionProgress("Validating extracted text...")
      const validation = validateExtractedText(extractionResult.text)
      
      if (!validation.isValid) {
        const errorMsg = `Text validation failed:\n${validation.issues.join('\n')}\n\nSuggestions:\n${validation.suggestions.join('\n')}`
        console.warn("Text validation issues:", validation)
        setError(errorMsg)
        setIsExtracting(false)
        return
      }

      // Step 3: Upload extracted text and metadata to server
      setIsExtracting(false)
      setIsUploading(true)
      setExtractionProgress("Uploading to server...")
      
      const result = await uploadTextExtract({
        file,
        userId: user.id,
        rawText: extractionResult.text,
        rawPages: extractionResult.pages, // Include pages array for page-by-page processing
        extractionMethod: extractionResult.method,
      })
      
      setJob(result)
      setExtractionProgress("Processing questions...")

      // Poll for final results
      beginPolling(result.id)
    } catch (e: any) {
      console.error("Upload error:", e)
      setError(e?.message ?? "Upload failed")
      setIsExtracting(false)
      setIsUploading(false)
    } finally {
      if (!error) {
        setExtractionProgress("")
      }
    }
  }

  /**
   * Resume monitoring an existing job without re-uploading
   * Useful for jobs that are still processing when user navigates away
   * OR for jobs that are ready for review
   */
  async function resumeJob(existingJob: QuestionImportJob) {
    setError(null)
    setJob(existingJob)
    
    // If job is ready, just set it as current (FileImportReviewCard will show)
    if (existingJob.status === "ready") {
      return
    }
    
    // Only start polling/processing if job is still in progress
    if (existingJob.status === "pending" || existingJob.status === "processing") {
      setExtractionProgress("Processing questions...")
      
      // Check if we need to trigger Edge Function processing
      // This includes: pending jobs OR processing jobs that have raw_text/raw_pages 
      // (meaning extraction completed but parsing may have failed)
      const needsProcessing = 
        existingJob.status === "pending" || 
        (existingJob.status === "processing" && (existingJob.raw_text || existingJob.raw_pages))
      
      if (needsProcessing) {
        console.log(`Triggering processing for job ${existingJob.id} (status: ${existingJob.status})`)
        try {
          const { processImportJob } = await import("../server/questionImport.actions")
          
          // Fire and forget - let it process in background
          processImportJob(existingJob.id).catch(err => {
            console.error(`Failed to trigger processing for job ${existingJob.id}:`, err)
            // Timeout errors are expected, job will update via polling
          })
          
          // Mark as processing in local state
          setJob({ ...existingJob, status: "processing" })
        } catch (err: any) {
          console.error("Failed to import processImportJob:", err)
          setError("Failed to resume processing")
          return
        }
      }
      
      // Start polling to monitor progress
      beginPolling(existingJob.id)
    }
  }

  useEffect(() => () => stopPolling(), [])

  /**
   * Delete an import job
   * Can be used for any job status (pending, processing, failed)
   */
  async function deleteJob(jobId: string) {
    try {
      const { deleteImportJob } = await import("../server/deleteImportJob.actions")
      const result = await deleteImportJob(jobId)
      
      if (!result.success) {
        setError(result.error || "Failed to delete job")
        return false
      }
      
      // Clear local state if this was the current job
      if (job?.id === jobId) {
        setJob(null)
        stopPolling()
      }
      
      return true
    } catch (err: any) {
      console.error("Failed to delete job:", err)
      setError("Failed to delete job")
      return false
    }
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
