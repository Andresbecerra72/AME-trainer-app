"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getUserStats, getExamHistory } from "@/lib/db-actions"
import type { AnalyticsData, TopicPerformance, StudyTimeData } from "../types"

/**
 * Get comprehensive analytics data for a user
 */
export async function getUserAnalytics(userId: string): Promise<AnalyticsData> {
  const supabase = await createSupabaseServerClient()
  
  // Fetch user stats and exam history
  const userStats = await getUserStats(userId)
  const examHistory = await getExamHistory(userId, 50)

  // Fetch topics
  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .order("name")

  // Calculate topic performance
  const topicPerformance: TopicPerformance[] =
    topics
      ?.map((topic) => {
        const topicExams = examHistory.filter((exam) =>
          exam.topic_ids.includes(topic.id)
        )
        const totalQuestions = topicExams.reduce(
          (sum, exam) => sum + exam.question_count,
          0
        )
        const totalCorrect = topicExams.reduce(
          (sum, exam) => sum + exam.correct_answers,
          0
        )
        const averageScore =
          totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0

        return {
          id: topic.id,
          title: topic.name,
          questionsAttempted: totalQuestions,
          averageScore,
          timeSpent: topicExams.reduce((sum, exam) => sum + exam.time_taken, 0) / 60,
        }
      })
      .filter((topic) => topic.questionsAttempted > 0)
      .sort((a, b) => a.averageScore - b.averageScore) || []

  // Get weak and strong areas
  const weakAreas = topicPerformance.slice(0, 3)
  const strongAreas = topicPerformance.slice(-3).reverse()

  // Calculate study time for last 7 days
  const studyTimeData = calculateStudyTime(examHistory)

  // Overall stats
  const overallStats = {
    reputation: userStats.profile?.reputation || 0,
    questionsContributed: userStats.questionsContributed,
    totalExams: userStats.totalExams,
    averageScore: userStats.averageScore,
  }

  return {
    overallStats,
    studyTimeData,
    topicPerformance,
    weakAreas,
    strongAreas,
  }
}

/**
 * Calculate study time for the last 7 days
 */
function calculateStudyTime(examHistory: any[]): StudyTimeData[] {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  return last7Days.map((date) => {
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
}
