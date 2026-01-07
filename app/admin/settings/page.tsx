import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Settings, Zap, Shield, Users } from "lucide-react"
import Link from "next/link"
import { getSession } from "@/features/auth/services/getSession"

export default async function SystemSettingsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (role !== "super_admin") {
    redirect("/protected/dashboard")
  }

  const settingsSections = [
    {
      title: "Quick Actions",
      description: "Manage quick action cards visibility for each role",
      icon: Zap,
      href: "/admin/settings/quick-actions",
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "System Settings",
      description: "Configure global platform settings",
      icon: Settings,
      href: "/admin/settings/system",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Security",
      description: "Configure security and access policies",
      icon: Shield,
      href: "/admin/settings/security",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Settings" showBack={false} />

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Admin Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure and manage platform settings and features
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.href} href={section.href}>
                <MobileCard className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                  <div className="p-6 space-y-4">
                    <div className={`p-3 rounded-lg ${section.bgColor} w-fit`}>
                      <Icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </MobileCard>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
