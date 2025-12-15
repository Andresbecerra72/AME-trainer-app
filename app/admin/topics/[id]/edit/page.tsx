import { getCurrentUser, getTopics } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { redirect, notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { TopicForm } from "../../../../../features/topics/components/topic-form"
import { getAllTopicsClient } from "@/features/topics/services/topic.api"
import { getSession } from "@/features/auth/services/getSession"

export default async function EditTopicPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const { user, role } = await getSession()
  
    if (!user) {
      redirect("/public/auth/login")
    }
  
    if (!role || role !== "super_admin") {
      redirect("/protected/dashboard")
    }

  const topics = await getAllTopicsClient()
  const topic = topics.find((t) => t.id === id)

  if (!topic) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Edit Topic" showBack />

      <div className="p-4">
        <TopicForm topic={topic} />
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
