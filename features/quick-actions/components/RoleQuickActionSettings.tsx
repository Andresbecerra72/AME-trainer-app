"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Save, GripVertical } from "lucide-react"
import type { RoleQuickAction } from "../types"
import { bulkUpdateRoleQuickActions } from "../services/quick-actions.api"
import { useToast } from "@/hooks/use-toast"
import { DynamicIcon } from "./DynamicIcon"

interface RoleQuickActionSettingsProps {
  userConfig: RoleQuickAction[]
  adminConfig: RoleQuickAction[]
  superAdminConfig: RoleQuickAction[]
}

export function RoleQuickActionSettings({
  userConfig,
  adminConfig,
  superAdminConfig,
}: RoleQuickActionSettingsProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // State for each role
  const [userActions, setUserActions] = useState(userConfig)
  const [adminActions, setAdminActions] = useState(adminConfig)
  const [superAdminActions, setSuperAdminActions] = useState(superAdminConfig)

  const toggleVisibility = (
    role: "user" | "admin" | "super_admin",
    actionId: string
  ) => {
    const setState = {
      user: setUserActions,
      admin: setAdminActions,
      super_admin: setSuperAdminActions,
    }[role]

    const currentState = {
      user: userActions,
      admin: adminActions,
      super_admin: superAdminActions,
    }[role]

    setState(
      currentState.map((action) =>
        action.quick_action_id === actionId
          ? { ...action, is_hidden: !action.is_hidden }
          : action
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Prepare updates for all roles
      const userUpdates = userActions.map((action, index) => ({
        quick_action_id: action.quick_action_id,
        is_hidden: action.is_hidden,
        display_order: index,
      }))

      const adminUpdates = adminActions.map((action, index) => ({
        quick_action_id: action.quick_action_id,
        is_hidden: action.is_hidden,
        display_order: index,
      }))

      const superAdminUpdates = superAdminActions.map((action, index) => ({
        quick_action_id: action.quick_action_id,
        is_hidden: action.is_hidden,
        display_order: index,
      }))

      // Execute updates
      const [userResult, adminResult, superResult] = await Promise.all([
        bulkUpdateRoleQuickActions("user", userUpdates),
        bulkUpdateRoleQuickActions("admin", adminUpdates),
        bulkUpdateRoleQuickActions("super_admin", superAdminUpdates),
      ])

      if (userResult.success && adminResult.success && superResult.success) {
        toast({
          title: "Settings saved",
          description: "Quick action visibility updated for all roles.",
        })
      } else {
        throw new Error("Failed to update some configurations")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const renderRoleConfig = (
    role: "user" | "admin" | "super_admin",
    actions: RoleQuickAction[]
  ) => {
    const roleColors = {
      user: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      admin: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      super_admin: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    }

    const visibleCount = actions.filter((a) => !a.is_hidden).length
    const totalCount = actions.length

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Configuration for {role.replace("_", " ")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {visibleCount} of {totalCount} actions visible
            </p>
          </div>
          <Badge className={roleColors[role]} variant="secondary">
            {visibleCount} visible
          </Badge>
        </div>

        <div className="grid gap-3">
          {actions.map((action) => {
            const qa = action.quick_action
            if (!qa) return null

            return (
              <Card
                key={action.id}
                className={`transition-all ${
                  action.is_hidden
                    ? "opacity-50 bg-muted/30"
                    : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div
                      className={`p-3 rounded-lg ${qa.bg_color} flex-shrink-0`}
                    >
                      <DynamicIcon iconName={qa.icon} className={`w-5 h-5 ${qa.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {qa.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {qa.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {qa.path}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {action.is_hidden ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-green-600" />
                      )}
                      <Switch
                        checked={!action.is_hidden}
                        onCheckedChange={() =>
                          toggleVisibility(role, action.quick_action_id)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions Management</CardTitle>
          <CardDescription>
            Control which quick actions are visible for each user role. Hidden
            actions won't appear in the dashboard for that role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="super_admin">Super Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              {renderRoleConfig("user", userActions)}
            </TabsContent>

            <TabsContent value="admin">
              {renderRoleConfig("admin", adminActions)}
            </TabsContent>

            <TabsContent value="super_admin">
              {renderRoleConfig("super_admin", superAdminActions)}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-between pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Changes will take effect immediately for all users
            </p>
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
