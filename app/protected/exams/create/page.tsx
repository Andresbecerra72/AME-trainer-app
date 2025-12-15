import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getTopics } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { ExamCreateForm } from "./exam-create-form"

export default async function CreateExamPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const topics = await getTopics()

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Create Community Exam" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <ExamCreateForm topics={topics} />
      </main>
    </div>
  )
}
