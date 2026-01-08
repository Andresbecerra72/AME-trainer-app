"use client"

import { useState, useEffect } from "react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff, Cloud, Signal, SignalHigh, SignalLow } from "lucide-react"
import { cn } from "@/lib/utils"

export function NetworkStatusBanner() {
  const networkInfo = useNetworkStatus()
  const [showBanner, setShowBanner] = useState(false)
  const [hasBeenOffline, setHasBeenOffline] = useState(false)

  useEffect(() => {
    if (!networkInfo.online) {
      setShowBanner(true)
      setHasBeenOffline(true)
    } else if (hasBeenOffline && networkInfo.online) {
      // Show "back online" message briefly
      setShowBanner(true)
      const timer = setTimeout(() => {
        setShowBanner(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [networkInfo.online, hasBeenOffline])

  if (!showBanner) return null

  const getConnectionQuality = () => {
    if (!networkInfo.online) return "offline"
    if (!networkInfo.effectiveType) return "online"

    switch (networkInfo.effectiveType) {
      case "slow-2g":
      case "2g":
        return "poor"
      case "3g":
        return "fair"
      case "4g":
        return "good"
      default:
        return "online"
    }
  }

  const quality = getConnectionQuality()

  const getIcon = () => {
    if (quality === "offline") return <WifiOff className="h-4 w-4" />
    if (quality === "poor") return <SignalLow className="h-4 w-4" />
    if (quality === "fair") return <Signal className="h-4 w-4" />
    if (quality === "good") return <SignalHigh className="h-4 w-4" />
    return <Wifi className="h-4 w-4" />
  }

  const getMessage = () => {
    if (!networkInfo.online) {
      return {
        title: "You're offline",
        description: "Some features may be limited. Changes will sync when you're back online.",
        variant: "destructive" as const,
      }
    }

    if (networkInfo.saveData) {
      return {
        title: "Data saver mode",
        description: "Some content may be limited to save your data.",
        variant: "default" as const,
      }
    }

    if (quality === "poor") {
      return {
        title: "Slow connection",
        description: "You're experiencing slow network speeds.",
        variant: "warning" as const,
      }
    }

    if (hasBeenOffline && networkInfo.online) {
      return {
        title: "Back online",
        description: "Your connection has been restored.",
        variant: "success" as const,
      }
    }

    return {
      title: "Online",
      description: "You're connected to the internet.",
      variant: "default" as const,
    }
  }

  const message = getMessage()

  return (
    <div className="fixed top-16 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-top duration-300">
      <Card
        className={cn(
          "shadow-lg border",
          message.variant === "destructive" && "border-destructive bg-destructive/10",
          message.variant === "warning" && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
          message.variant === "success" && "border-green-500 bg-green-50 dark:bg-green-950/20"
        )}
      >
        <CardContent className="p-3 flex items-start gap-3">
          <div
            className={cn(
              "flex-shrink-0 mt-0.5",
              message.variant === "destructive" && "text-destructive",
              message.variant === "warning" && "text-yellow-600 dark:text-yellow-400",
              message.variant === "success" && "text-green-600 dark:text-green-400"
            )}
          >
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-0.5">{message.title}</h3>
            <p className="text-xs text-muted-foreground">{message.description}</p>
            
            {networkInfo.effectiveType && networkInfo.online && (
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {networkInfo.effectiveType && (
                  <span>Type: {networkInfo.effectiveType.toUpperCase()}</span>
                )}
                {networkInfo.downlink && (
                  <span>↓ {networkInfo.downlink} Mbps</span>
                )}
                {networkInfo.rtt && (
                  <span>RTT: {networkInfo.rtt}ms</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
