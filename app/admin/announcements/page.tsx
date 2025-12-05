import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Plus } from "lucide-react"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"

export default async function AnnouncementsPage() {
  const supabase = await createSupabaseServerClient()
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

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, creator:users!announcements_created_by_fkey(full_name)")
    .order("created_at", { ascending: false })

  const typeBadgeVariant: Record<string, any> = {
    info: "default",
    warning: "secondary",
    success: "default",
    error: "destructive",
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="System Announcements" showBack />

      <div className="p-4 space-y-4">
        <Button asChild className="w-full">
          <Link href="/admin/announcements/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Announcement
          </Link>
        </Button>

        {announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <MobileCard key={announcement.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-primary" />
                      <Badge variant={typeBadgeVariant[announcement.type]}>{announcement.type}</Badge>
                      {!announcement.is_active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{announcement.message}</p>
                  </div>

                  {announcement.expires_at && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">Created by: {announcement.creator?.full_name}</p>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : (
          <MobileCard>
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No announcements yet</p>
            </div>
          </MobileCard>
        )}
      </div>

      <BottomNav userRole={profile.role} />
    </div>
  )
}
