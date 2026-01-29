"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestionImportJob } from "../types"
import { getImportJob, uploadTextExtract, pollImportJobStatus } from "../server/questionImport.actions"
import { getSession } from "@/features/auth/services/getSession"
import { extractTextFromFile, validateExtractedText } from "../utils/textExtraction"
import { deleteImportJob } from "../server/deleteImportJob.actions"
import { useImportNotifications } from "./useImportNotifications"

export function useQuestionImportJob() {
  const [job, setJob] = useState<QuestionImportJob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [progressDetails, setProgressDetails] = useState<{
    currentPage?: number
    totalPages?: number
    questionsExtracted?: number
    percentage?: number
    warnings?: string[]
  } | null>(null)

  const pollRef = useRef<number | null>(null)
  const warningsShownRef = useRef<Set<string>>(new Set())

  // Setup notifications
  const { notifyCompletion, notifyError, notifyWarning } = useImportNotifications({
    jobId: job?.id || null,
    enabled: true,
  })

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
    warningsShownRef.current.clear()
    
    pollRef.current = window.setInterval(async () => {
      try {
        // Get detailed progress
        const status = await pollImportJobStatus(jobId)
        
        // Process warnings from Edge Function
        const edgeWarnings: string[] = []
        if (status.warnings && status.warnings.length > 0) {
          status.warnings.forEach((w) => {
            const warningKey = `page-${w.page}-${w.type}`
            if (!warningsShownRef.current.has(warningKey)) {
              let userMessage = ""
              
              // Map technical warnings to user-friendly messages
              if (w.message.includes("Wall clock time budget exceeded")) {
                userMessage = `⏱️ Page ${w.page}: Processing timeout (function exceeded time limit)`
              } else if (w.message.includes("OpenAI request timeout")) {
                userMessage = `⏱️ Page ${w.page}: OpenAI timeout (>60s per page)`
              } else if (w.message.includes("early termination")) {
                userMessage = `⚠️ Page ${w.page}: Processing terminated early (time limit reached)`
              } else if (w.message.includes("Rate limit")) {
                userMessage = `🚦 Page ${w.page}: OpenAI rate limit reached, skipping temporarily`
              } else if (w.message.includes("Server error")) {
                userMessage = `⚠️ Page ${w.page}: OpenAI server error, retrying may help`
              } else if (w.message.includes("Insufficient text")) {
                userMessage = `📄 Page ${w.page}: Insufficient text content`
              } else if (w.type === "no_questions") {
                userMessage = `❓ Page ${w.page}: No questions found on this page`
              } else {
                userMessage = `⚠️ Page ${w.page}: ${w.message}`
              }
              
              notifyWarning(userMessage)
              warningsShownRef.current.add(warningKey)
              edgeWarnings.push(userMessage)
            }
          })
        }
        
        // Legacy warning check (for backwards compatibility)
        if (status.progress && status.questionsExtracted === 0 && status.progress.current > 0 && edgeWarnings.length === 0) {
          const warningMsg = `${status.progress.current} page(s) processed but no questions extracted yet. Some pages may have timed out.`
          if (!warningsShownRef.current.has(warningMsg)) {
            notifyWarning(warningMsg)
            warningsShownRef.current.add(warningMsg)
            edgeWarnings.push(warningMsg)
          }
        }
        
        // Update progress details
        setProgressDetails({
          currentPage: status.progress?.current,
          totalPages: status.progress?.total,
          questionsExtracted: status.questionsExtracted,
          percentage: status.progress?.percentage,
          warnings: Array.from(warningsShownRef.current),
        })

        // Get full job details
        const latest = await getImportJob(jobId)
        setJob(latest)

        // Handle completion
        if (latest.status === "ready" || latest.status === "failed") {
          stopPolling()
          
          if (latest.status === "ready") {
            // Show summary with failed pages if any
            const failedCount = status.failedPages?.length || 0
            const successCount = status.successfulPages?.length || 0
            
            if (failedCount > 0) {
              notifyCompletion(status.questionsExtracted || 0)
              setTimeout(() => {
                notifyWarning(`⚠️ Import complete with warnings: ${failedCount} page(s) had issues, ${successCount} succeeded`)
              }, 1000)
            } else {
              notifyCompletion(status.questionsExtracted || 0)
            }
          } else if (latest.status === "failed") {
            notifyError(latest.error || undefined)
            setError(latest.error || "Import failed")
          }
        }
      } catch (err) {
        // Ignore transient errors during polling
        console.warn("Polling error:", err)
      }
    }, 2000) // 2 seconds interval
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
        const errorMsg = `Unable to extract text from this file. ${validation.issues[0] || 'Please try a different file.'}`
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
        resetState() // Clear all state when deleting current job
        setProgressDetails(null)
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
    progressDetails,
    startUpload,
    resumeJob,
    deleteJob,
  }
}
