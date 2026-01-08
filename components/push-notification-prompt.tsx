"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BellOff } from "lucide-react"

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return
    }

    const currentPermission = Notification.permission
    setPermission(currentPermission)

    // Show prompt if permission is default and user hasn't dismissed
    const dismissed = localStorage.getItem("push-notification-dismissed")
    if (currentPermission === "default" && !dismissed) {
      // Wait 2 minutes before showing
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 120000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleRequestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === "granted") {
        console.log("Notification permission granted")
        
        // Subscribe to push notifications
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready
          
          // This would typically involve subscribing to a push service
          // For now, we'll just log success
          console.log("Ready to receive push notifications")
        }

        setShowPrompt(false)
      } else {
        console.log("Notification permission denied")
        setShowPrompt(false)
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("push-notification-dismissed", new Date().toISOString())
  }

  if (!showPrompt || permission !== "default") {
    return null
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom duration-300">
      <Card className="shadow-lg border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Stay Updated</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Get notified about new questions, exam updates, and study reminders
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-2">
          <Button onClick={handleRequestPermission} className="w-full" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <BellOff className="mr-2 h-4 w-4" />
            Not Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
