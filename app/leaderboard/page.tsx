import { createSupabaseServerClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Trophy, Award, TrendingUp, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let userRole: "user" | "admin" | "super_admin" = "user"

  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
    userRole = profile?.role || "user"
  }

  // Fetch top users by reputation
  const { data: topUsers } = await supabase
    .from("users")
    .select("*")
    .order("reputation_points", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Leaderboard" showBack />

      <div className="p-4 space-y-4">
        <MobileCard>
          <div className="text-center py-4">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h2 className="text-xl font-bold">Top Contributors</h2>
            <p className="text-sm text-muted-foreground mt-1">Earn points by helping the community</p>
          </div>
        </MobileCard>

        {topUsers && topUsers.length > 0 ? (
          <div className="space-y-2">
            {topUsers.map((user, index) => (
              <LeaderboardCard key={user.id} user={user} rank={index + 1} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No contributors yet"
            description="Be the first to contribute and earn reputation points!"
            actionLabel="Submit a Question"
            actionHref="/community/add-question"
          />
        )}
      </div>

      <BottomNav userRole={userRole} />
    </div>
  )
}

function LeaderboardCard({ user, rank }: { user: any; rank: number }) {
  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Award className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />
    return null
  }

  const getRankBadge = () => {
    if (rank <= 3) return "default"
    if (rank <= 10) return "secondary"
    return "outline"
  }

  return (
    <Link href={`/profile/${user.id}`}>
      <MobileCard className="hover:border-primary transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
            {getRankIcon() || (
              <Badge variant={getRankBadge() as any} className="w-8 h-8 flex items-center justify-center">
                {rank}
              </Badge>
            )}
          </div>

          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
            <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user.full_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{user.reputation_points || 0} points</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>{user.questions_answered || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">answers</p>
          </div>
        </div>
      </MobileCard>
    </Link>
  )
}
