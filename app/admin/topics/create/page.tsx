import { getCurrentUser } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { TopicForm } from "../topic-form"

export default async function CreateTopicPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "super_admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Create Topic" showBack />

      <div className="p-4">
        <TopicForm />
      </div>

      <BottomNav userRole={currentUser.role} />
    </div>
  )
}
