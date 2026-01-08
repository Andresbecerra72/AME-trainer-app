import { Metadata } from "next"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CacheManager } from "@/components/cache-manager"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Download, Bell, Wifi, Database, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "PWA Settings - AME Exam Trainer",
  description: "Progressive Web App settings and information",
}

export default function PWASettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="PWA Settings" showBack />
      
      <div className="container max-w-2xl py-6 space-y-6">
        {/* PWA Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle>Progressive Web App</CardTitle>
              </div>
              <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Active
              </Badge>
            </div>
            <CardDescription>
              This app works offline and can be installed on your device
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {/* Features */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Download className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Installable</h4>
                  <p className="text-xs text-muted-foreground">
                    Install the app on your home screen for quick access
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Wifi className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Offline Support</h4>
                  <p className="text-xs text-muted-foreground">
                    Access previously visited pages and cached content offline
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Push Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    Receive updates about new questions and study reminders
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Database className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Background Sync</h4>
                  <p className="text-xs text-muted-foreground">
                    Your progress syncs automatically when you're back online
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Fast Performance</h4>
                  <p className="text-xs text-muted-foreground">
                    Optimized caching for lightning-fast page loads
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache Manager */}
        <CacheManager />

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Technical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Worker Version</span>
              <span className="font-mono">v2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Caching Strategy</span>
              <span className="font-mono">Network First</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache Lifetime</span>
              <span className="font-mono">24 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Image Cache</span>
              <span className="font-mono">7 days</span>
            </div>
          </CardContent>
        </Card>

        {/* Installation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">How to Install</CardTitle>
            <CardDescription className="text-xs">
              Add this app to your home screen for the best experience
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">On Android (Chrome)</h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Tap the menu button (three dots)</li>
                <li>Select "Install app" or "Add to Home screen"</li>
                <li>Follow the prompts to install</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">On iOS (Safari)</h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Tap the Share button</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">On Desktop (Chrome/Edge)</h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Look for the install icon in the address bar</li>
                <li>Click "Install AME Exam Trainer"</li>
                <li>The app will open in its own window</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
