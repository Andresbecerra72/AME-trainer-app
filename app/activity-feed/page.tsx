import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { Activity, MessageSquare, FileQuestion, GraduationCap, Clock } from "lucide-react"
import { getRecentPlatformActivity } from "@/lib/db-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function ActivityFeedPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  const userRole = profile?.role || "user"

  const activities = await getRecentPlatformActivity(50)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Platform Activity" showBack />

      <div className="p-4 space-y-4">
        <MobileCard>
          <div className="text-center py-4">
            <Activity className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">See what's happening in the community</p>
          </div>
        </MobileCard>

        {activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <ActivityCard key={`${activity.type}-${activity.id}-${index}`} activity={activity} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Be the first to contribute to the platform!"
            actionLabel="Add a Question"
            actionHref="/community/add-question"
          />
        )}
      </div>

      <BottomNav userRole={userRole} />
    </div>
  )
}

function ActivityCard({ activity }: { activity: any }) {
  const getIcon = () => {
    switch (activity.type) {
      case "question":
        return <FileQuestion className="w-5 h-5 text-blue-500" />
      case "comment":
        return <MessageSquare className="w-5 h-5 text-green-500" />
      case "exam":
        return <GraduationCap className="w-5 h-5 text-purple-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getLink = () => {
    if (activity.type === "question") return `/community/questions/${activity.id}`
    if (activity.type === "comment" && activity.questionId) return `/community/questions/${activity.questionId}`
    if (activity.type === "exam") return `/exams/${activity.id}`
    return "#"
  }

  const getActionText = () => {
    switch (activity.type) {
      case "question":
        return "submitted a question"
      case "comment":
        return "commented on"
      case "exam":
        return "created an exam"
      default:
        return "performed an action"
    }
  }

  return (
    <Link href={getLink()}>
      <MobileCard className="hover:border-primary transition-colors">
        <div className="flex gap-3">
          <div className="flex-shrink-0">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={activity.user?.avatar_url || "/placeholder.svg"} alt={activity.user?.full_name} />
                <AvatarFallback>{activity.user?.full_name?.[0] || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{activity.user?.full_name || "Anonymous"}</span>{" "}
                  <span className="text-muted-foreground">{getActionText()}</span>
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-balance line-clamp-2 pl-10">
              {activity.type === "comment" && activity.questionText ? (
                <>
                  <span className="text-muted-foreground">on: </span>
                  <span className="font-medium">{activity.questionText}</span>
                </>
              ) : (
                activity.text
              )}
            </p>
          </div>
        </div>
      </MobileCard>
    </Link>
  )
}
