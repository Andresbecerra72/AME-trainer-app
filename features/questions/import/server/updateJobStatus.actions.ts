"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ImportJobStatus } from "../types"

/**
 * Update the status of an import job
 * Only the owner can update their own jobs
 */
export async function updateJobStatus(jobId: string, status: ImportJobStatus) {
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

    // Verify ownership before updating
    const { data: job, error: fetchError } = await supabase
      .from("question_imports")
      .select("id, user_id")
      .eq("id", jobId)
      .single()

    if (fetchError || !job) {
      return {
        success: false,
        error: "Job not found",
      }
    }

    if (job.user_id !== user.id) {
      return {
        success: false,
        error: "Not authorized to update this job",
      }
    }

    // Update the status
    const { error: updateError } = await supabase
      .from("question_imports")
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    if (updateError) {
      return {
        success: false,
        error: "Failed to update job status: " + updateError.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating job status:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}
