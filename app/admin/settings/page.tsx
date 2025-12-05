import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { getSystemSettings, updateSystemSetting } from "@/lib/db-actions"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default async function SystemSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    redirect("/dashboard")
  }

  const settings = await getSystemSettings()

  async function updateSetting(formData: FormData) {
    "use server"
    const key = formData.get("key") as string
    const value = formData.get("value") as string

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      const parsedValue = JSON.parse(value)
      await updateSystemSetting(key, parsedValue, user.id)
    } catch (error) {
      console.error("[v0] Error parsing setting value:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="System Settings" showBack />

      <div className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground mb-4">Configure global platform settings and features</div>

        {settings.map((setting) => (
          <MobileCard key={setting.id}>
            <form action={updateSetting}>
              <input type="hidden" name="key" value={setting.setting_key} />
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm capitalize">{setting.setting_key.replace(/_/g, " ")}</h3>
                  {setting.description && <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={setting.setting_key} className="text-xs">
                    Configuration (JSON)
                  </Label>
                  <Textarea
                    id={setting.setting_key}
                    name="value"
                    defaultValue={JSON.stringify(setting.setting_value, null, 2)}
                    className="font-mono text-xs"
                    rows={4}
                  />
                </div>

                <Button type="submit" size="sm" className="w-full">
                  Update Setting
                </Button>
              </div>
            </form>
          </MobileCard>
        ))}

        <MobileCard>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Changes to system settings take effect immediately</p>
          </div>
        </MobileCard>
      </div>
    </div>
  )
}
