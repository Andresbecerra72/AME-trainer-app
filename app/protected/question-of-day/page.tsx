import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { BottomNav } from "@/components/bottom-nav"
import { getQuestionOfDay } from "@/features/question-of-day"
import { DailyQuestionCard } from "@/features/question-of-day"

export default async function QuestionOfDayPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const qotd = await getQuestionOfDay()

  if (!qotd?.question) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <MobileHeader title="Question of the Day" showBack />
        <div className="max-w-2xl mx-auto px-6 py-8">
          <MobileCard>
            <p className="text-muted-foreground text-center">No question available today.</p>
          </MobileCard>
        </div>
        <BottomNav userRole={profile?.role} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Question of the Day" showBack />

      <div className="max-w-2xl mx-auto px-6 py-6">
        <DailyQuestionCard question={qotd.question} date={qotd.date} />
      </div>

      <BottomNav userRole={profile?.role} />
    </div>
  )
}
