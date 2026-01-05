import { createSupabaseServerClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { redirect } from "next/navigation"
import { getTopics } from "@/lib/db-actions"
import { QuestionForm } from "@/features/community/components/QuestionForm"

export default async function AddQuestionPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const topics = await getTopics()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Add Question" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <QuestionForm topics={topics} mode="create" />
      </main>

      <BottomNav />
    </div>
  )
}
