"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { QuestionImportJob } from "../types"

/**
 * Get all pending/processing jobs for the current user
 * Returns jobs that are still being processed to allow resuming monitoring
 */
export async function getPendingJobs(): Promise<QuestionImportJob[]> {
  const supabase = await createSupabaseServerClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return []
    }
    
    const { data, error } = await supabase
      .from("question_imports")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "ready"])
      .order("created_at", { ascending: false })
      .limit(5) // Only show last 5 pending jobs
    
    if (error) throw error
    
    return (data || []) as QuestionImportJob[]
  } catch (error) {
    console.error("Error fetching pending jobs:", error)
    return []
  }
}
