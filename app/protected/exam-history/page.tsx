import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { getExamHistory } from "@/lib/db-actions"
import { Calendar } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ExamStatsCard } from "@/features/exams/components/ExamStatsCard"
import { ExamHistoryList } from "@/features/exams/components/ExamHistoryList"
import { calculateExamStats, sortExamHistoryByDate } from "@/features/exams/exam-history.logic"
import { getSession } from "@/features/auth/services/getSession"

export default async function ExamHistoryPage() {
 const { profile, role } = await getSession()

  // Obtener historial de exámenes
  const examHistoryRaw = await getExamHistory(profile.id, 50)
  
  // Ordenar por fecha (más reciente primero)
  const examHistory = sortExamHistoryByDate(examHistoryRaw)
  
  // Calcular estadísticas usando lógica de negocio
  const stats = calculateExamStats(examHistory)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Exam History" showBack />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {examHistory.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Exam History"
            description="You haven't taken any exams yet. Start practicing to track your progress!"
            actionLabel="Take an Exam"
            actionHref="/protected/exam/setup"
          />
        ) : (
          <>
            <ExamStatsCard stats={stats} />
            <ExamHistoryList examHistory={examHistory} />
          </>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
