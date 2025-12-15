import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { ProgressBar } from "@/components/progress-bar"
import { TrendingUp, TrendingDown, AlertCircle, Clock, Target, Award } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getUserStats, getExamHistory } from "@/lib/db-actions"

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const userStats = await getUserStats(user.id)
  const examHistory = await getExamHistory(user.id, 50)

  const { data: topics } = await supabase.from("topics").select("*").order("name")

  const topicPerformance =
    topics
      ?.map((topic) => {
        const topicExams = examHistory.filter((exam) => exam.topic_ids.includes(topic.id))
        const totalQuestions = topicExams.reduce((sum, exam) => sum + exam.question_count, 0)
        const totalCorrect = topicExams.reduce((sum, exam) => sum + exam.correct_answers, 0)
        const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

        return {
          id: topic.id,
          title: topic.name,
          questionsAttempted: totalQuestions,
          averageScore,
          timeSpent: topicExams.reduce((sum, exam) => sum + exam.time_taken, 0) / 60, // Convert to minutes
        }
      })
      .filter((topic) => topic.questionsAttempted > 0)
      .sort((a, b) => a.averageScore - b.averageScore) || []

  const weakAreas = topicPerformance.slice(0, 3)
  const strongAreas = topicPerformance.slice(-3).reverse()

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const studyTimeData = last7Days.map((date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayExams = examHistory.filter((exam) => {
      const examDate = new Date(exam.completed_at)
      return examDate >= dayStart && examDate <= dayEnd
    })

    const totalMinutes = dayExams.reduce((sum, exam) => sum + exam.time_taken, 0) / 60

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      hours: Math.round((totalMinutes / 60) * 10) / 10,
    }
  })

  const maxHours = Math.max(...studyTimeData.map((d) => d.hours), 1)

  const overallStats = {
    reputation: userStats.profile?.reputation || 0,
    questionsContributed: userStats.questionsContributed,
    totalExams: userStats.totalExams,
    averageScore: userStats.averageScore,
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Progress Analytics" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Overall Stats */}
        <MobileCard className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">{overallStats.reputation}</div>
              <div className="text-sm text-muted-foreground">Reputation</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">{overallStats.questionsContributed}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">{overallStats.totalExams}</div>
              <div className="text-sm text-muted-foreground">Exams Taken</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">{overallStats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </MobileCard>

        {/* Study Time Chart */}
        <MobileCard className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Study Time Last 7 Days
          </h2>
          <div className="space-y-2">
            {studyTimeData.map((data) => (
              <div key={data.day} className="flex items-center gap-3">
                <div className="w-10 text-sm font-medium text-muted-foreground">{data.day}</div>
                <div className="flex-1 relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${(data.hours / maxHours) * 100}%` }}
                  >
                    {data.hours > 0 && (
                      <span className="text-xs font-medium text-primary-foreground">{data.hours}h</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-border text-sm text-muted-foreground">
            Total: {studyTimeData.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}h last 7 days
          </div>
        </MobileCard>

        {/* Performance by Topic */}
        {topicPerformance.length > 0 && (
          <MobileCard className="space-y-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Performance by Topic
            </h2>
            <div className="space-y-3">
              {topicPerformance.map((topic) => (
                <div key={topic.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">{topic.title}</span>
                    <span className="text-muted-foreground">{topic.averageScore}%</span>
                  </div>
                  <ProgressBar
                    value={topic.averageScore}
                    showPercentage={false}
                    color={topic.averageScore >= 80 ? "success" : topic.averageScore >= 60 ? "warning" : "danger"}
                  />
                </div>
              ))}
            </div>
          </MobileCard>
        )}

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <MobileCard className="space-y-4 bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800">
            <h2 className="font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Areas to Improve
            </h2>
            <div className="space-y-3">
              {weakAreas.map((topic) => (
                <div key={topic.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-red-900 dark:text-red-100">{topic.title}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {topic.questionsAttempted} questions attempted
                    </div>
                  </div>
                  <div className="text-red-900 dark:text-red-100 font-semibold">{topic.averageScore}%</div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Focus your studies on these topics to improve your overall performance
              </p>
            </div>
          </MobileCard>
        )}

        {/* Strong Areas */}
        {strongAreas.length > 0 && (
          <MobileCard className="space-y-4 bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800">
            <h2 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Strong Areas
            </h2>
            <div className="space-y-3">
              {strongAreas.map((topic) => (
                <div key={topic.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-green-900 dark:text-green-100">{topic.title}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      {topic.questionsAttempted} questions attempted
                    </div>
                  </div>
                  <div className="text-green-900 dark:text-green-100 font-semibold">{topic.averageScore}%</div>
                </div>
              ))}
            </div>
          </MobileCard>
        )}

        {/* Show message if no exam history */}
        {topicPerformance.length === 0 && (
          <MobileCard className="text-center py-8">
            <p className="text-muted-foreground mb-4">No exam data yet. Take your first exam to see your analytics!</p>
            <a
              href="/protected/exam/setup"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Exam
            </a>
          </MobileCard>
        )}

        {/* Recommendations */}
        <MobileCard className="bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-foreground mb-3">Recommendations</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Continue contributing quality questions to earn more reputation</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Engage with the community by commenting on questions</span>
            </li>
            {weakAreas.length > 0 && (
              <li className="flex gap-2">
                <span>•</span>
                <span>Focus on improving weak areas: {weakAreas.map((t) => t.title).join(", ")}</span>
              </li>
            )}
            <li className="flex gap-2">
              <span>•</span>
              <span>Take practice exams regularly to track your progress</span>
            </li>
          </ul>
        </MobileCard>
      </div>

      <BottomNav userRole={userStats.profile?.role} />
    </div>
  )
}
