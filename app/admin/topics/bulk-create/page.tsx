import { MobileHeader } from "@/components/mobile-header"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { TopicBatchForm } from "@/features/topics/components/topic-batch-form"

export default async function BulkCreateTopicsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || role !== "super_admin") {
    redirect("/protected/dashboard")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Bulk Create Topics" showBack />

      <div className="p-4 max-w-5xl mx-auto">
        <TopicBatchForm />
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
