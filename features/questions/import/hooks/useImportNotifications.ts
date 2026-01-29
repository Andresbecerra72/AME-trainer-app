"use client"

import { useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"

interface ImportNotificationOptions {
  jobId: string | null
  enabled?: boolean
  onComplete?: () => void
  onError?: () => void
}

/**
 * Hook para enviar notificaciones del sistema cuando cambia el estado del import
 * Incluye notificaciones del navegador si el usuario sale de la página
 */
export function useImportNotifications({
  jobId,
  enabled = true,
  onComplete,
  onError,
}: ImportNotificationOptions) {
  const notificationPermissionRef = useRef<NotificationPermission>("default")
  const hasShownCompletionRef = useRef(false)
  const previousJobIdRef = useRef<string | null>(null)

  // Request notification permission on mount
  useEffect(() => {
    if (enabled && "Notification" in window) {
      notificationPermissionRef.current = Notification.permission

      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          notificationPermissionRef.current = permission
        })
      }
    }
  }, [enabled])

  // Reset completion flag when jobId changes
  useEffect(() => {
    if (jobId !== previousJobIdRef.current) {
      hasShownCompletionRef.current = false
      previousJobIdRef.current = jobId
    }
  }, [jobId])

  // Send browser notification
  const sendBrowserNotification = (title: string, body: string, tag?: string) => {
    if (!enabled || !("Notification" in window)) return
    if (notificationPermissionRef.current !== "granted") return
    if (document.visibilityState === "visible") return // User is on the page

    try {
      new Notification(title, {
        body,
        icon: "/icon.svg",
        tag: tag || "import-notification",
        requireInteraction: false,
      })
    } catch (error) {
      console.error("Failed to send notification:", error)
    }
  }

  // Notify completion
  const notifyCompletion = (questionsExtracted: number) => {
    if (hasShownCompletionRef.current) return
    hasShownCompletionRef.current = true

    const message = `Import completed! ${questionsExtracted} question${questionsExtracted !== 1 ? 's' : ''} extracted successfully.`

    // Show toast
    toast({
      title: "✅ Import Complete",
      description: message,
      duration: 5000,
    })

    // Send browser notification if user is away
    sendBrowserNotification("Import Complete", message, `import-complete-${jobId}`)

    onComplete?.()
  }

  // Notify error
  const notifyError = (errorMessage?: string) => {
    const message = errorMessage || "An error occurred during import"

    // Show toast
    toast({
      title: "❌ Import Failed",
      description: message,
      variant: "destructive",
      duration: 7000,
    })

    // Send browser notification if user is away
    sendBrowserNotification("Import Failed", message, `import-error-${jobId}`)

    onError?.()
  }

  // Notify warning
  const notifyWarning = (warningMessage: string) => {
    toast({
      title: "⚠️ Import Warning",
      description: warningMessage,
      duration: 5000,
    })
  }

  return {
    notifyCompletion,
    notifyError,
    notifyWarning,
    hasNotificationPermission: notificationPermissionRef.current === "granted",
  }
}
