import { getCommunityExams } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { getCurrentUser } from "@/features/auth/services/auth.server"
import { ExamsClient } from "./exams-client"

export default async function CommunityExamsPage() {
  const {
    data: { user },
  } = await getCurrentUser()

  const exams = await getCommunityExams({ limit: 50 })

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Community Exams" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <ExamsClient exams={exams} userId={user?.id || null} />
      </main>

      <BottomNav />
    </div>
  )
}
