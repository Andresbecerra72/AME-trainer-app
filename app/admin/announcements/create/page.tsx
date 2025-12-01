import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createAnnouncement } from "@/lib/db-actions"

export default async function CreateAnnouncementPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  async function handleCreate(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const message = formData.get("message") as string
    const type = formData.get("type") as "info" | "warning" | "success" | "error"
    const expiresAt = formData.get("expires_at") as string

    await createAnnouncement(title, message, type, expiresAt || undefined)
    redirect("/admin/announcements")
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Create Announcement" showBack />

      <div className="p-4">
        <MobileCard>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Announcement title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" placeholder="Announcement message" rows={4} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" className="w-full p-2 border rounded-md bg-background" required>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input id="expires_at" name="expires_at" type="datetime-local" />
            </div>

            <Button type="submit" className="w-full">
              Create Announcement
            </Button>
          </form>
        </MobileCard>
      </div>
    </div>
  )
}
