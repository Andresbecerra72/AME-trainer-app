import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Users, Shield, ShieldCheck, User, Trash } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { getAllUserProfiles } from "@/features/profiles/services/profile.server"
import { deleteUser, updateUserRole } from "@/features/profiles/services/profile.api"

export default async function UsersManagementPage() {
  const { user, profile } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (!profile || profile.role !== "super_admin") {
    redirect("/protected/dashboard")
  }

  // Fetch all users (moved to feature API)
  const { data: users } = await getAllUserProfiles("*", "created_at", false)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="User Management" showBack />

      <div className="p-4 space-y-4">
        <MobileCard>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h2 className="font-semibold">Total Users</h2>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
            </div>
          </div>
        </MobileCard>

        <div className="space-y-2">
          {users?.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>

      <BottomNav userRole={profile.role} />
    </div>
  )
}

function UserCard({ user }: { user: any }) {
  const getRoleIcon = () => {
    switch (user.role) {
      case "super_admin":
        return <ShieldCheck className="w-5 h-5 text-purple-500" />
      case "admin":
        return <Shield className="w-5 h-5 text-blue-500" />
      default:
        return <User className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getRoleBadge = () => {
    switch (user.role) {
      case "super_admin":
        return <Badge className="bg-purple-500">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>
      default:
        return <Badge variant="outline">User</Badge>
    }
  }

  return (
    <MobileCard>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
            <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user.full_name}</h3>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {getRoleIcon()}
              {getRoleBadge()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-semibold">{user.reputation_points || 0}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div>
            <p className="font-semibold">{user.questions_answered || 0}</p>
            <p className="text-xs text-muted-foreground">Answers</p>
          </div>
          <div>
            <p className="font-semibold">{user.correct_answers || 0}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
        </div>

        <form>
          <input type="hidden" name="userId" value={user.id} />
          <div className="flex gap-2 items-center">
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button formAction={updateUserRole} size="sm">
              Update
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="ml-2">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete user</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">This will permanently remove the user's profile. This action cannot be undone.</p>
                </DialogHeader>

                <form action={deleteUser} className="mt-4">
                  <input type="hidden" name="userId" value={user.id} />
                  <DialogFooter>
                    <Button type="submit" variant="destructive">Confirm delete</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </div>
    </MobileCard>
  )
}
