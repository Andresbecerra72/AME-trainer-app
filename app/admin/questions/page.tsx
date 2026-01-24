import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { getAllTopicsServer } from "@/features/topics/services/topic.server"
import { AdminQuestionFilters } from "@/features/questions/components/admin-question-filters"
import { AdminQuestionList } from "@/features/questions/components/admin-question-list"
import { MobileHeaderBack } from "@/components/mobile-header-back"

export default async function AdminQuestionsPage() {
  const { user, role } = await getSession()  
      
  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/protected/dashboard")
  }

  const topics = await getAllTopicsServer()

  return (
    <div className="min-h-screen bg-background pb-24 scroll-smooth">
      <MobileHeaderBack title="Manage Questions" backUrl="/admin" />

      <div id="top" className="p-4 space-y-4">
        {/* Filters */}
        <AdminQuestionFilters topics={topics} />
        {/* Questions List & Stats */}
        <AdminQuestionList/>
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
