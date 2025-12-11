import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Bell, MessageSquare, ThumbsUp, Award, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { getSession } from "@/features/auth/services/getSession"
import { getUserNotifications } from "@/features/notifications/services/notifications.server"
import { markAllNotificationsAsRead } from "@/features/notifications/services/notifications.api"

export default async function NotificationsPage() {
  const { user, profile } = await getSession()
 
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch notifications
  const notifications = await getUserNotifications(user.id)

  // Server Action used by the form to mark all notifications as read
   async function markAllRead(formData: FormData) {
    "use server"
    const userId = formData.get("userId")
    if (!userId || typeof userId !== "string") return
    await markAllNotificationsAsRead(userId)
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
              <input type="hidden" name="userId" value={user.id} />
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
            <p className="text-sm font-medium leading-relaxed">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.created_at)}</p>
          </div>
          {!notification.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
        </div>
      </MobileCard>
    </Link>
  )
}
