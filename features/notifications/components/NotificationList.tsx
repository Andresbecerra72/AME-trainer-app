"use client"

import { useState } from "react"
import { MobileCard } from "@/components/mobile-card"
import { Bell, MessageSquare, ThumbsUp, Award, AlertCircle, CheckCircle, XCircle, Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { markNotificationAsRead } from "@/features/notifications/services/notifications.api"

interface NotificationListProps {
  initialNotifications: any[]
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )

    try {
      await markNotificationAsRead(notificationId)
    } catch (error) {
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n))
      )
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="w-5 h-5" />
      case "vote":
        return <ThumbsUp className="w-5 h-5" />
      case "badge":
        return <Award className="w-5 h-5" />
      case "question_approved":
        return <CheckCircle className="w-5 h-5" />
      case "question_rejected":
        return <XCircle className="w-5 h-5" />
      case "report":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "comment":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
      case "vote":
        return "text-green-500 bg-green-50 dark:bg-green-950/20"
      case "badge":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      case "question_approved":
        return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
      case "question_rejected":
        return "text-red-500 bg-red-50 dark:bg-red-950/20"
      case "report":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950/20"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const fixNotificationLink = (link: string | null) => {
    if (!link) return "/protected/community"
    if (link.startsWith("/protected/") || link.startsWith("/public/") || link.startsWith("/admin/")) {
      return link
    }
    if (link.startsWith("/community/") || link.startsWith("/profile/") || link.startsWith("/questions/")) {
      return `/protected${link}`
    }
    return link
  }

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let label = "Older"
    if (date.toDateString() === today.toDateString()) {
      label = "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday"
    }

    if (!acc[label]) acc[label] = []
    acc[label].push(notification)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedNotifications).map(([label, groupNotifications]) => (
        <div key={label} className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {label}
          </h3>
          <div className="space-y-2">
            {(groupNotifications as any[]).map((notification: any) => {
              const isLinkValid = notification.isValid !== false
              
              const CardContent = (
                <MobileCard
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
                    !notification.is_read && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        getIconColor(notification.type)
                      )}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-relaxed text-foreground">
                        {notification.message}
                      </p>
                      {!isLinkValid && (
                        <p className="text-xs text-orange-500 font-medium">
                          ⚠️ This content is no longer available
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{timeAgo(notification.created_at)}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleMarkAsRead(notification.id)
                          }}
                          className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                </MobileCard>
              )

              return isLinkValid ? (
                <Link key={notification.id} href={fixNotificationLink(notification.link)}>
                  {CardContent}
                </Link>
              ) : (
                <div key={notification.id} className="opacity-60 cursor-not-allowed">
                  {CardContent}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
