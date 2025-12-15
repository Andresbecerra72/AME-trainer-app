import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { getAllTopicsClient } from "@/features/topics/services/topic.api"
import { TopicList } from "@/features/topics/components/topic-list"

export default async function TopicsManagementPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || role !== "super_admin") {
    redirect("/protected/dashboard")
  }

  const topics = await getAllTopicsClient()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Manage Topics" showBack />

      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Topics ({topics.length})</h2>
          <Link href="/admin/topics/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </Link>
        </div>

        <TopicList topics={topics} />
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
