"use client"

import { useState, useEffect } from "react"
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { markAnnouncementViewed } from "@/lib/db-actions"

interface Announcement {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
}

export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("dismissed_announcements")
    if (stored) {
      setDismissed(JSON.parse(stored))
    }
  }, [])

  const handleDismiss = async (id: string) => {
    const newDismissed = [...dismissed, id]
    setDismissed(newDismissed)
    localStorage.setItem("dismissed_announcements", JSON.stringify(newDismissed))
    await markAnnouncementViewed(id)
  }

  const activeAnnouncements = announcements.filter((a) => !dismissed.includes(a.id))

  if (activeAnnouncements.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      case "success":
        return <CheckCircle className="w-5 h-5" />
      case "error":
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-100"
      case "success":
        return "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-100"
      case "error":
        return "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-100"
    }
  }

  return (
    <div className="space-y-2">
      {activeAnnouncements.map((announcement) => (
        <div key={announcement.id} className={`border rounded-lg p-3 ${getStyles(announcement.type)}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(announcement.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm mb-1">{announcement.title}</p>
              <p className="text-xs leading-relaxed">{announcement.message}</p>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
