"use client"

import { useEffect, useState } from "react"

interface NetworkInfo {
  online: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

export function useNetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateOnlineStatus = () => {
      setNetworkInfo((prev) => ({ ...prev, online: navigator.onLine }))
    }

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection

      if (connection) {
        setNetworkInfo({
          online: navigator.onLine,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        })

        // Send network quality to service worker
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "NETWORK_QUALITY",
            quality: connection.effectiveType,
          })
        }
      }
    }

    // Initial update
    updateNetworkInfo()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Listen for network changes
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo)
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)

      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}
