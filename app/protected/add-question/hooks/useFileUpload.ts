"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useQuestionImportJob } from "@/features/questions/import/hooks/useQuestionImportJob"
import { usePendingJobs } from "@/features/questions/import/hooks/usePendingJobs"
import { createQuestionsBatch } from "@/features/questions/import/server/questionImport.actions"
import { DraftQuestion } from "@/features/questions/import/types"
import { User } from "@/lib/types"

export function useFileUpload(user: User | undefined) {
  const router = useRouter()
  const { toast } = useToast()
  const { job, isUploading, isExtracting, extractionProgress, error, startUpload, resumeJob, deleteJob } = useQuestionImportJob()
  const { pendingJobs, isLoading: isPendingJobsLoading, refresh: refreshPendingJobs } = usePendingJobs()

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Session Error",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      })
      return
    }

    try {
      await startUpload(file)
      refreshPendingJobs()
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleResumeJob = async (resumeJobData: any) => {
    await resumeJob(resumeJobData)
    
    const message = resumeJobData.status === "ready" 
      ? "Review the parsed questions and save them."
      : `Now monitoring "${resumeJobData.file_name || 'Untitled'}"`
    
    toast({
      title: resumeJobData.status === "ready" ? "Ready for Review" : "Monitoring Resumed",
      description: message,
    })
  }

  const handleDeleteJob = async (jobToDelete: any) => {
    const fileName = jobToDelete.file_name || "Untitled"
    
    const success = await deleteJob(jobToDelete.id)
    
    if (success) {
      toast({
        title: "Job Deleted",
        description: `"${fileName}" has been removed.`,
      })
      refreshPendingJobs()
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitFileImport = async (payload: {
    topic_id: string
    difficulty: "easy" | "medium" | "hard"
    questions: DraftQuestion[]
  }) => {
    try {
      const result = await createQuestionsBatch(payload)
      
      toast({
        title: "Success",
        description: `${result.inserted} question${result.inserted === 1 ? '' : 's'} from file submitted for review.`,
      })

      if (job?.id) {
        const { updateJobStatus } = await import("@/features/questions/import/server/updateJobStatus.actions")
        await updateJobStatus(job.id, "completed")
      }

      refreshPendingJobs()
      router.push("/protected/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit questions from file.",
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    job,
    isUploading,
    isExtracting,
    extractionProgress,
    error,
    pendingJobs,
    isPendingJobsLoading,
    handleFileUpload,
    handleResumeJob,
    handleDeleteJob,
    handleSubmitFileImport,
  }
}
