"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getNotifications } from "@/lib/db-actions"

interface NotificationBadgeProps {
  userId: string
}

export function NotificationBadge({ userId }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      const notifications = await getNotifications(userId)
      const unread = notifications.filter((n) => !n.is_read).length
      setUnreadCount(unread)
    }
    fetchUnread()

    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [userId])

  if (unreadCount === 0) return null

  return (
    <Badge
      variant="destructive"
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </Badge>
  )
}
