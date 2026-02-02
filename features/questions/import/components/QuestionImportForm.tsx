// ===============================
// QuestionImportForm.tsx
// ===============================

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ImportProgressBar } from "./ImportProgressBar"
import { ExtractionProgressBar, ExtractionProgressData } from "./ExtractionProgressBar"
import { Upload } from "lucide-react"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { User } from "@/lib/types"
import { QuestionImportJob } from "../types"
import { QuestionsProgressDetails } from "../hooks/useQuestionImportJob"

interface QuestionImportFormProps {
  user: User | undefined
  job: QuestionImportJob | null
  isUploading: boolean
  isExtracting: boolean
  extractionProgress: string
  error: string | null
  extractionDetails: ExtractionProgressData | null
  progressDetails?: QuestionsProgressDetails | null
  onFileUpload: (file: File) => Promise<void>
}

export function QuestionImportForm({
    user,
    job,
    isUploading,
    isExtracting,
    extractionProgress,
    extractionDetails,
    progressDetails,
    error,
    onFileUpload
  }: QuestionImportFormProps) {


  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {!job && (
          <div className="space-y-2">
                <MobileCard className="border-dashed border-2 p-10 text-center space-y-4 hover:border-primary/50 transition-colors">
            <div className="flex justify-center">
              <div className="p-6 bg-primary/10 rounded-2xl">
                <Upload className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">Upload Question File</p>
              <p className="text-base text-muted-foreground">PDF or image files supported</p>
            </div>
            <input 
              type="file" 
              accept="application/pdf,image/*" 
              className="hidden" 
              id="file-upload"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFileUpload(file)
                e.target.value = ''
              }}
              disabled={!user?.id || isUploading || isExtracting}
            />
            <label htmlFor="file-upload">
              <PrimaryButton 
                type="button" 
                onClick={() => document.getElementById("file-upload")?.click()} 
                className="h-12 px-8 text-base"
                disabled={!user?.id || isUploading || isExtracting}
              >
                {isExtracting ? "Extracting..." : isUploading ? "Uploading..." : "Choose File"}
              </PrimaryButton>
            </label>
          </MobileCard>
           
          </div>
        )}
        
        {/* Extraction Progress - shown during text extraction phase */}
        {extractionDetails && (
          <ExtractionProgressBar progress={extractionDetails} />
        )}

        {/* Import Progress - shown after extraction during upload/processing */}
        {(isUploading || job) && !isExtracting && (
          <ImportProgressBar
            progress={{
              status:   job?.status === "ready" ? "ready" :
              job?.status === "failed" ? "failed" :
              job?.status === "processing" ? "processing" :
              "idle",
              message: extractionProgress,
              currentPage: progressDetails?.currentPage,
              totalPages: progressDetails?.totalPages,
              percentage: progressDetails?.percentage,
              questionsExtracted: progressDetails?.questionsExtracted,
              error: error || undefined,
              warnings: progressDetails?.warnings,
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
