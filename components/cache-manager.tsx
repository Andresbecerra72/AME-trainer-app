"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Database, Trash2, RefreshCw } from "lucide-react"

interface CacheStats {
  size: number
  caches: Array<{
    name: string
    size: number
  }>
}

export function CacheManager() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const updateCacheStats = async () => {
    if (typeof window === "undefined" || !("caches" in window)) {
      return
    }

    try {
      const cacheNames = await caches.keys()
      const stats: CacheStats = {
        size: 0,
        caches: [],
      }

      for (const cacheName of cacheNames) {
        if (cacheName.startsWith("ame-")) {
          const cache = await caches.open(cacheName)
          const requests = await cache.keys()
          
          stats.caches.push({
            name: cacheName,
            size: requests.length,
          })
          
          stats.size += requests.length
        }
      }

      setCacheStats(stats)
    } catch (error) {
      console.error("Error fetching cache stats:", error)
    }
  }

  useEffect(() => {
    updateCacheStats()

    // Update stats every 30 seconds
    const interval = setInterval(updateCacheStats, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleClearCache = async () => {
    if (!("caches" in window)) return

    setIsClearing(true)

    try {
      const cacheNames = await caches.keys()
      
      for (const cacheName of cacheNames) {
        if (cacheName.startsWith("ame-")) {
          await caches.delete(cacheName)
        }
      }

      // Notify service worker
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLEAR_CACHE",
        })
      }

      // Refresh stats
      await updateCacheStats()

      // Reload page to re-cache
      window.location.reload()
    } catch (error) {
      console.error("Error clearing cache:", error)
    } finally {
      setIsClearing(false)
    }
  }

  const handleRefreshCache = async () => {
    setIsRefreshing(true)

    try {
      // Force update service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
        }
      }

      await updateCacheStats()
    } catch (error) {
      console.error("Error refreshing cache:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!cacheStats) {
    return null
  }

  const maxSize = 100 // Assuming max 100 cached items
  const progress = Math.min((cacheStats.size / maxSize) * 100, 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Cache Storage</CardTitle>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {cacheStats.size} items
          </div>
        </div>
        <CardDescription>
          Manage your offline storage and cached content
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage used</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {cacheStats.caches.map((cache) => (
            <div
              key={cache.name}
              className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30"
            >
              <span className="text-muted-foreground truncate">
                {cache.name.replace("ame-", "").replace(/-v\d+\.\d+\.\d+$/, "")}
              </span>
              <span className="font-medium">{cache.size} items</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRefreshCache}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isClearing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cache
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Clearing cache will remove all offline content and require a page refresh.
        </p>
      </CardContent>
    </Card>
  )
}
