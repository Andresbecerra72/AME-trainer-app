"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { markQuestionInconsistent } from "@/lib/db-actions"
import { revalidatePath } from "next/cache"

export async function getPendingReports() {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, full_name, avatar_url),
      question:questions(id, question_text, status, option_a, option_b, option_c, option_d, correct_answer)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return data || []
}

export async function resolveReport(formData: FormData) {
   const reportId = formData.get("reportId") as string
  const action = formData.get("action") as string
  const supabase = await createSupabaseServerClient() 

   const { data, error } = await supabase
    .from("reports")
    .update({
      status: action,
      reviewed_at: new Date().toISOString(),
      reviewed_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    })
    .eq("id", reportId)
    .select("id, status, reviewed_by, reviewed_at") 
    .single();
  console.log("Resolve Report -> reportId:", reportId, "action:", action);
  console.log("Resolve Report -> data:", data);

  // Revalidate the reports page to update the list
  revalidatePath("/admin/reports")
  console.log("Resolve Report -> error:", error);
}

export async function markInconsistentAndResolve(formData: FormData) {
  const questionId = formData.get("questionId") as string
  const notes = formData.get("notes") as string


  // Revalidate the reports page to update the list
  revalidatePath("/admin/reports")
  await markQuestionInconsistent(questionId, notes)

  await resolveReport(formData)
}
