"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImportProgressBar } from "./ImportProgressBar"
import { useQuestionImportJob } from "../hooks/useQuestionImportJob"
import type { ImportProgress } from "./ImportProgressBar"
import { FileText, Upload, X } from "lucide-react"

export function QuestionImportForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { 
    job, 
    isUploading, 
    isExtracting, 
    extractionProgress, 
    error,
    progressDetails,
    startUpload,
    deleteJob 
  } = useQuestionImportJob()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    await startUpload(selectedFile)
  }

  const handleCancel = async () => {
    if (job?.id) {
      await deleteJob(job.id)
    }
    setSelectedFile(null)
  }

  // Map job state to ImportProgress
  const getImportProgress = (): ImportProgress => {
    if (isExtracting) {
      return {
        status: "extracting",
        message: extractionProgress,
      }
    }

    if (isUploading) {
      return {
        status: "uploading",
        message: "Uploading to server...",
      }
    }

    if (job) {
      const status = job.status === "pending" || job.status === "processing" 
        ? "processing"
        : job.status === "ready"
        ? "ready"
        : job.status === "failed"
        ? "failed"
        : "idle"

      return {
        status,
        currentPage: progressDetails?.currentPage,
        totalPages: progressDetails?.totalPages,
        questionsExtracted: progressDetails?.questionsExtracted,
        percentage: progressDetails?.percentage,
        error: job.error || error || undefined,
        warnings: progressDetails?.warnings,
      }
    }

    return { status: "idle" }
  }

  const progress = getImportProgress()
  const isProcessing = isExtracting || isUploading || job?.status === "processing"
  const canUpload = selectedFile && !isProcessing

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Import Questions from PDF
        </CardTitle>
        <CardDescription>
          Upload a PDF file with exam questions. The system will extract and process them automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        {!job && (
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select PDF File</Label>
            <div className="flex gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={isProcessing}
                className="flex-1"
              />
              {selectedFile && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* Progress */}
        {(isProcessing || job) && (
          <ImportProgressBar progress={progress} />
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!job && (
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload and Process
            </Button>
          )}

          {job && job.status !== "ready" && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isExtracting || isUploading}
            >
              Cancel Import
            </Button>
          )}

          {job?.status === "ready" && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Import Another File
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && !job && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
