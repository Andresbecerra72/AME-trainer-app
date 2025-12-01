import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Globe, Moon, Bell, LogOut, ChevronRight, Shield, Folder } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Settings" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Profile Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </h2>
          <MobileCard className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" defaultValue={profile?.display_name || ""} className="h-12" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email || ""} className="h-12" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Reputation Points</Label>
              <div className="text-2xl font-bold text-primary">{profile?.reputation || 0}</div>
            </div>
            {profile?.role && profile.role !== "user" && (
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium capitalize">{profile.role.replace("_", " ")}</span>
                </div>
              </div>
            )}
          </MobileCard>
        </div>

        {/* App Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">App Settings</h2>

          {/* Language */}
          <MobileCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground">Choose app language</p>
                </div>
              </div>
              <Select defaultValue="en" disabled>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </MobileCard>

          {/* Dark Mode */}
          <MobileCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="dark-mode" className="text-base cursor-pointer">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
              </div>
              <Switch id="dark-mode" disabled />
            </div>
          </MobileCard>

          {/* Notifications */}
          <MobileCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications" className="text-base cursor-pointer">
                    Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Daily study reminders</p>
                </div>
              </div>
              <Switch id="notifications" defaultChecked disabled />
            </div>
          </MobileCard>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Links</h2>

          <Link href="/profile/me">
            <MobileCard className="hover:border-primary transition-colors">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-base font-medium text-foreground">View Profile</div>
                    <p className="text-sm text-muted-foreground">See your public profile</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </MobileCard>
          </Link>

          <Link href="/settings/notifications">
            <MobileCard className="hover:border-primary transition-colors">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-base font-medium text-foreground">Notification Preferences</div>
                    <p className="text-sm text-muted-foreground">Customize your notifications</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </MobileCard>
          </Link>

          <Link href="/collections">
            <MobileCard className="hover:border-primary transition-colors">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-base font-medium text-foreground">My Collections</div>
                    <p className="text-sm text-muted-foreground">Organize your questions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </MobileCard>
          </Link>

          {(profile?.role === "admin" || profile?.role === "super_admin") && (
            <Link href="/admin">
              <MobileCard className="hover:border-primary transition-colors">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <div className="text-base font-medium text-foreground">Admin Dashboard</div>
                      <p className="text-sm text-muted-foreground">Manage users and content</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </MobileCard>
            </Link>
          )}
        </div>

        {/* Account Actions */}
        <div className="space-y-4">
          <form action="/api/auth/signout" method="POST">
            <MobileCard>
              <button
                type="submit"
                className="w-full flex items-center gap-3 py-2 text-destructive hover:opacity-70 transition-opacity"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-base font-medium">Log Out</span>
              </button>
            </MobileCard>
          </form>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1 pt-4">
          <p>AME Exam Trainer Social Edition v1.0.0</p>
          <p>Built with Next.js and Supabase</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
