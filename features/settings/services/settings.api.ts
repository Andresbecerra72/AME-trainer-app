import { createSupabaseServerClient } from "@/lib/supabase/server"
import { updateSystemSetting } from "@/lib/db-actions"

export async function updateSetting(formData: FormData) {
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
