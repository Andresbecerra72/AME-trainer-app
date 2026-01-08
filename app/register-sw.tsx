"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration.scope)

          // Check for updates periodically
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            console.log("🔄 Service Worker update found")

            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  console.log("✨ New Service Worker installed")
                  
                  // Optionally notify user about update
                  if (
                    window.confirm(
                      "New version available! Reload to update?"
                    )
                  ) {
                    newWorker.postMessage({ type: "SKIP_WAITING" })
                    window.location.reload()
                  }
                }
              })
            }
          })

          // Update service worker every hour
          setInterval(
            () => {
              registration.update()
            },
            60 * 60 * 1000
          )
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error)
        })

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("🔄 Service Worker controller changed")
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("📬 Message from Service Worker:", event.data)
      })

      // Track app installation
      window.addEventListener("appinstalled", () => {
        console.log("📱 PWA installed successfully")
        
        // Track with analytics if available
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "app_installed", {
            event_category: "engagement",
            event_label: "PWA Installation",
          })
        }
      })

      // Handle online/offline events
      window.addEventListener("online", () => {
        console.log("🌐 Back online")
        // Optionally sync data here
      })

      window.addEventListener("offline", () => {
        console.log("📵 Offline mode")
      })
    }
  }, [])

  return null
}
