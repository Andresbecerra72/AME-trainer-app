import { createClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Trophy, Award, Star, TrendingUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { notFound } from "next/navigation"

export default async function TopicLeaderboardPage({ params }: { params: { topicId: string } }) {
  const supabase = await createClient()
  const topicId = params.topicId

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let userRole: "user" | "admin" | "super_admin" = "user"

  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
    userRole = profile?.role || "user"
  }

  // Fetch topic details
  const { data: topic } = await supabase.from("topics").select("*").eq("id", topicId).single()

  if (!topic) {
    notFound()
  }

  // Fetch top contributors for this topic
  const { data: topicQuestions } = await supabase
    .from("questions")
    .select(`
      author_id,
      votes,
      author:users(id, full_name, avatar_url, reputation_points)
    `)
    .eq("topic_id", topicId)
    .eq("status", "approved")

  // Aggregate by author
  const contributorMap = new Map()

  topicQuestions?.forEach((q) => {
    if (!q.author_id || !q.author) return

    if (!contributorMap.has(q.author_id)) {
      contributorMap.set(q.author_id, {
        ...q.author,
        questionCount: 0,
        totalVotes: 0,
      })
    }

    const contributor = contributorMap.get(q.author_id)
    contributor.questionCount += 1
    contributor.totalVotes += q.votes || 0
  })

  const topContributors = Array.from(contributorMap.values())
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 50)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title={`${topic.code} Leaderboard`} showBack />

      <div className="p-4 space-y-4">
        <MobileCard>
          <div className="text-center py-4">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h2 className="text-xl font-bold">{topic.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Top contributors for this topic</p>
          </div>
        </MobileCard>

        {topContributors.length > 0 ? (
          <div className="space-y-2">
            {topContributors.map((contributor, index) => (
              <TopicLeaderboardCard key={contributor.id} contributor={contributor} rank={index + 1} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No contributors yet"
            description="Be the first to contribute to this topic!"
            actionLabel="Add Question"
            actionHref="/community/add-question"
          />
        )}
      </div>

      <BottomNav userRole={userRole} />
    </div>
  )
}

function TopicLeaderboardCard({ contributor, rank }: { contributor: any; rank: number }) {
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
    <Link href={`/profile/${contributor.id}`}>
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
            <AvatarImage src={contributor.avatar_url || "/placeholder.svg"} alt={contributor.full_name} />
            <AvatarFallback>{contributor.full_name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{contributor.full_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{contributor.totalVotes} votes</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>{contributor.questionCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">questions</p>
          </div>
        </div>
      </MobileCard>
    </Link>
  )
}
