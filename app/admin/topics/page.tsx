import { getCurrentUser, getTopics } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { TopicList } from "./topic-list"

export default async function TopicsManagementPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "super_admin") {
    redirect("/dashboard")
  }

  const topics = await getTopics()

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

      <BottomNav userRole={currentUser.role} />
    </div>
  )
}
