import { getCurrentUser } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { TopicForm } from "../../../../features/topics/components/topic-form"
import { getSession } from "@/features/auth/services/getSession"

export default async function CreateTopicPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || role !== "super_admin") {
    redirect("/protected/dashboard")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Create Topic" showBack />

      <div className="p-4">
        <TopicForm />
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
