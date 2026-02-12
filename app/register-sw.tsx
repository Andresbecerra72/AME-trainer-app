"use client"

import { useEffect } from "react"

type SyncManagerLike = {
  register: (tag: string) => Promise<void>
}

export function RegisterServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("✅ Service Worker v2.0.0 registered:", registration.scope)

          // Track service worker registration
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "sw_registered", {
              event_category: "pwa",
              event_label: "Service Worker v2.0.0",
            })
          }

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
                  
                  // Notify user about update
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
          
          // Track registration failure
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "sw_registration_failed", {
              event_category: "pwa",
              event_label: error.message,
            })
          }
        })

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("🔄 Service Worker controller changed")
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("📬 Message from Service Worker:", event.data)
        
        if (event.data.type === "CACHE_SIZE") {
          console.log("Cache size:", event.data.size, "items")
        }
      })

      // Track app installation
      window.addEventListener("appinstalled", () => {
        console.log("📱 PWA installed successfully")
        
        // Track with analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "app_installed", {
            event_category: "engagement",
            event_label: "PWA Installation",
          })
        }

        // Hide install prompt
        localStorage.removeItem("pwa-install-dismissed")
      })

      // Handle online/offline events
      window.addEventListener("online", () => {
        console.log("🌐 Back online")
        
        // Track online event
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "network_online", {
            event_category: "connectivity",
          })
        }

        // Trigger background sync if needed
        navigator.serviceWorker.ready
          .then((reg) => {
            if ("sync" in reg) {
              const syncManager = (reg as ServiceWorkerRegistration & { sync: SyncManagerLike }).sync
              syncManager.register("sync-study-progress")
                .catch((error) => {
                  console.log("Background sync registration failed:", error)
                })
            }
          })
          .catch((error) => {
            console.log("Service worker not ready:", error)
          })
      })

      window.addEventListener("offline", () => {
        console.log("📵 Offline mode")
        
        // Track offline event
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "network_offline", {
            event_category: "connectivity",
          })
        }
      })

      // Track PWA launch method
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true

      if (isStandalone) {
        console.log("🚀 Launched as PWA")
        
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "pwa_launch", {
            event_category: "engagement",
            event_label: "Standalone Mode",
          })
        }
      }
    }
  }, [])

  return null
}
