import { getCurrentUser, getTopics } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { redirect, notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { TopicForm } from "../../topic-form"

export default async function EditTopicPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "super_admin") {
    redirect("/dashboard")
  }

  const topics = await getTopics()
  const topic = topics.find((t) => t.id === params.id)

  if (!topic) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Edit Topic" showBack />

      <div className="p-4">
        <TopicForm topic={topic} />
      </div>

      <BottomNav userRole={currentUser.role} />
    </div>
  )
}
