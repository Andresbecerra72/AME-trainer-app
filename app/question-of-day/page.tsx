import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { BottomNav } from "@/components/bottom-nav"
import { getQuestionOfDay } from "@/lib/db-actions"
import { AnswerButton } from "@/components/answer-button"
import { Calendar, Sparkles } from "lucide-react"

export default async function QuestionOfDayPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

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

  const question = qotd.question

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Question of the Day" showBack />

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <MobileCard className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Daily Challenge</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </MobileCard>

        <MobileCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">{question.topic?.code || "General"}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  question.difficulty === "easy"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                    : question.difficulty === "hard"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                }`}
              >
                {question.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-balance leading-relaxed">{question.question_text}</h3>

            <div className="space-y-2">
              {["A", "B", "C", "D"].map((option) => {
                const optionText = question[`option_${option.toLowerCase()}`]
                return (
                  <AnswerButton
                    key={option}
                    option={option}
                    text={optionText}
                    isCorrect={question.correct_answer === option}
                  />
                )
              })}
            </div>

            {question.explanation && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Explanation:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
              </div>
            )}

            <div className="pt-4 border-t text-xs text-muted-foreground">
              Contributed by {question.author?.full_name || "Anonymous"}
            </div>
          </div>
        </MobileCard>
      </div>

      <BottomNav userRole={profile?.role} />
    </div>
  )
}
