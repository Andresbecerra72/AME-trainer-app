import { createBadge, assignBadge, getBadges } from "@/features/badges/services/badges.api"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Award } from "lucide-react"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getAllUserProfiles } from "@/features/profiles/services/profile.server"
import { getSession } from "@/features/auth/services/getSession"

export default async function BadgesManagementPage() {
  const { user, role } = await getSession()
  
  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/protected/dashboard")
  }

  const { data: badges } = await getBadges()
  const { data: users } = await getAllUserProfiles()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Badge Management" showBack />

      <div className="p-4 space-y-6">
        {/* Create Badge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Create New Badge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createBadge} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Badge Name</Label>
                <Input id="name" name="name" placeholder="e.g., First Contribution" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="e.g., Submit your first question" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input id="icon" name="icon" placeholder="trophy" defaultValue="trophy" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" type="color" defaultValue="#FFD700" required />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create Badge
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Assign Badge */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Badge to User</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={assignBadge} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User</Label>
                <select
                  id="userId"
                  name="userId"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select a user</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="badgeId">Badge</Label>
                <select
                  id="badgeId"
                  name="badgeId"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select a badge</option>
                  {badges?.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full">
                Assign Badge
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Badges */}
        <div className="space-y-3">
          <h3 className="font-semibold">Existing Badges</h3>
          <div className="grid gap-3">
            {badges?.map((badge) => (
              <Card key={badge.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: badge.color + "20" }}
                  >
                    <Award className="h-5 w-5" style={{ color: badge.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
