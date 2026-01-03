"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Delete an import job and its associated file from storage
 * Only the owner can delete their own jobs
 */
export async function deleteImportJob(jobId: string) {
  const supabase = await createSupabaseServerClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    // Get the job to verify ownership and get file_path
    const { data: job, error: fetchError } = await supabase
      .from("question_imports")
      .select("id, user_id, file_path")
      .eq("id", jobId)
      .single()

    if (fetchError || !job) {
      return {
        success: false,
        error: "Job not found",
      }
    }

    // Verify ownership
    if (job.user_id !== user.id) {
      return {
        success: false,
        error: "Not authorized to delete this job",
      }
    }

    // Delete file from storage if exists
    if (job.file_path) {
      const { error: storageError } = await supabase.storage
        .from("question-imports")
        .remove([job.file_path])

      if (storageError) {
        console.error("Failed to delete file from storage:", storageError)
        // Continue anyway - job record is more important
      }
    }

    // Delete the job record
    const { error: deleteError } = await supabase
      .from("question_imports")
      .delete()
      .eq("id", jobId)

    if (deleteError) {
      return {
        success: false,
        error: "Failed to delete job: " + deleteError.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting import job:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}
