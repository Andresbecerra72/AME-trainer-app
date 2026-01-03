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

  useEffect(() => () => stopPolling(), [])

  return { 
    job, 
    isUploading, 
    isExtracting,
    extractionProgress,
    error, 
    startUpload 
  }
}
