import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { getSession } from "@/features/auth/services/getSession"
import { getRoleQuickActionsConfig } from "@/features/quick-actions/services/quick-actions.api"
import { RoleQuickActionSettings } from "@/features/quick-actions/components/RoleQuickActionSettings"

export default async function QuickActionsSettingsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (role !== "super_admin") {
    redirect("/protected/dashboard")
  }

  // Fetch configurations for all roles
  const [userConfig, adminConfig, superAdminConfig] = await Promise.all([
    getRoleQuickActionsConfig("user"),
    getRoleQuickActionsConfig("admin"),
    getRoleQuickActionsConfig("super_admin"),
  ])

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Quick Actions Settings" showBack />

      <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Quick Actions Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage which quick action cards are visible for each user role in the dashboard.
          </p>
        </div>

        <RoleQuickActionSettings
          userConfig={userConfig}
          adminConfig={adminConfig}
          superAdminConfig={superAdminConfig}
        />
      </div>
    </div>
  )
}
