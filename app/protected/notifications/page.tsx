import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { Bell, CheckCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { getSession } from "@/features/auth/services/getSession"
import { getUserNotifications } from "@/features/notifications/services/notifications.server"
import { markAllNotificationsAsRead } from "@/features/notifications/services/notifications.api"
import { NotificationList } from "@/features/notifications/components/NotificationList"
import { Card } from "@/components/ui/card"

export default async function NotificationsPage() {
  const { user, profile } = await getSession()
 
  if (!user) {
    redirect("/public/auth/login")
  }

  const notifications = await getUserNotifications(user.id)

  async function markAllRead(formData: FormData) {
    "use server"
    const userId = formData.get("userId")
    if (!userId || typeof userId !== "string") return
    await markAllNotificationsAsRead(userId)
  }

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      <MobileHeader title="Notifications" showBack />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header Stats Card */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background backdrop-blur-sm">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-6 h-6 text-primary" />
                  {notifications.length}
                  <span className="text-muted-foreground text-lg">notifications</span>
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {unreadCount > 0 ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-green-500" />
                      All caught up!
                    </>
                  )}
                </p>
              </div>
              {unreadCount > 0 && (
                <form action={markAllRead}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        {notifications && notifications.length > 0 ? (
          <NotificationList initialNotifications={notifications} />
        ) : (
          <div className="py-12">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="You'll see notifications here when someone interacts with your questions or when admins review your contributions."
            />
          </div>
        )}
      </div>

      <BottomNav userRole={profile?.role} unreadNotifications={unreadCount} />
    </div>
  )
}
