import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { QuestionCardItem } from "@/components/question-card-item"
import { Sparkles, TrendingUp } from "lucide-react"
import { getRecommendedQuestions } from "@/lib/db-actions"

export default async function RecommendationsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  const userRole = profile?.role || "user"

  const recommendations = await getRecommendedQuestions(user.id, 20)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Recommended for You" showBack />

      <div className="p-4 space-y-4">
        <MobileCard>
          <div className="text-center py-4">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500" />
            <h2 className="text-xl font-bold">Personalized Recommendations</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Questions tailored to help you improve in your weak areas
            </p>
          </div>
        </MobileCard>

        {recommendations.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Focus on these topics</h3>
            </div>
            {recommendations.map((question) => (
              <QuestionCardItem key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No recommendations yet"
            description="Take some exams to get personalized question recommendations based on your performance!"
            actionLabel="Take an Exam"
            actionhref="/protected/exam/setup"
          />
        )}
      </div>

      <BottomNav userRole={userRole} />
    </div>
  )
}
