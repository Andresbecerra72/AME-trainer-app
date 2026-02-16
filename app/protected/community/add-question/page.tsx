import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { redirect } from "next/navigation"
import { getTopics } from "@/lib/db-actions"
import { QuestionForm } from "@/features/community/components/QuestionForm"
import { getSession } from "@/features/auth"
import { getUserUnreadNotifications } from "@/features/notifications/services/notifications.server"

export default async function AddQuestionPage() {
 const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }
  const { count: unreadNotifications} = await getUserUnreadNotifications(user.id)

  const topics = await getTopics()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Add Question" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <QuestionForm topics={topics} mode="create" />
      </main>

      <BottomNav userRole={role} unreadNotifications={unreadNotifications || 0} />
    </div>
  )
}
