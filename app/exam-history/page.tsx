import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { BottomNav } from "@/components/bottom-nav"
import { getExamHistory } from "@/lib/db-actions"
import { Calendar, Clock, Target, TrendingUp } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

export default async function ExamHistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const examHistory = await getExamHistory(user.id, 50)

  const avgScore =
    examHistory.length > 0
      ? Math.round((examHistory.reduce((sum, exam) => sum + exam.score_percentage, 0) / examHistory.length) * 10) / 10
      : 0

  const totalQuestions = examHistory.reduce((sum, exam) => sum + exam.question_count, 0)
  const totalCorrect = examHistory.reduce((sum, exam) => sum + exam.correct_answers, 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Exam History" showBack />

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {examHistory.length > 0 && (
          <MobileCard>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Target className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">{examHistory.length}</div>
                <div className="text-xs text-muted-foreground">Exams Taken</div>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">{avgScore}%</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">{totalCorrect}</div>
                <div className="text-xs text-muted-foreground">Total Correct</div>
              </div>
            </div>
          </MobileCard>
        )}

        {examHistory.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Exam History"
            description="You haven't taken any exams yet. Start practicing to track your progress!"
            actionLabel="Take an Exam"
            actionHref="/exam/setup"
          />
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground px-1">Recent Exams</h2>
            {examHistory.map((exam) => (
              <MobileCard key={exam.id}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-2xl font-bold ${
                        exam.score_percentage >= 70
                          ? "text-green-600"
                          : exam.score_percentage >= 50
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {exam.score_percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exam.correct_answers}/{exam.question_count} correct
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(exam.completed_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(exam.time_taken / 60)}m {exam.time_taken % 60}s
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        exam.score_percentage >= 70
                          ? "bg-green-600"
                          : exam.score_percentage >= 50
                            ? "bg-amber-600"
                            : "bg-red-600"
                      }`}
                      style={{ width: `${exam.score_percentage}%` }}
                    />
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav userRole={profile?.role} />
    </div>
  )
}
