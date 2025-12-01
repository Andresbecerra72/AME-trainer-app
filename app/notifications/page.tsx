import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Bell, MessageSquare, ThumbsUp, Award, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:users!notifications_actor_id_fkey(id, full_name, avatar_url),
      question:questions(id, question_text)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  // Mark all as read
  async function markAllRead() {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
  }

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Notifications" showBack />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </div>
          {unreadCount > 0 && (
            <form action={markAllRead}>
              <Button variant="ghost" size="sm">
                Mark all read
              </Button>
            </form>
          )}
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You'll see notifications here when someone interacts with your questions or when admins review your contributions."
          />
        )}
      </div>
      <BottomNav userRole={profile?.role} unreadNotifications={unreadCount} />
    </div>
  )
}

function NotificationCard({ notification }: { notification: any }) {
  const getIcon = () => {
    switch (notification.type) {
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "vote":
        return <ThumbsUp className="w-5 h-5 text-green-500" />
      case "badge":
        return <Award className="w-5 h-5 text-yellow-500" />
      case "question_approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "question_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "report":
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Link href={notification.link || "/community"}>
      <MobileCard className={!notification.is_read ? "border-l-4 border-l-primary" : ""}>
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed">{notification.content}</p>
            <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.created_at)}</p>
          </div>
          {!notification.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
        </div>
      </MobileCard>
    </Link>
  )
}
