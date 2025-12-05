import { getProfile, getQuestions, getUserBadges } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, MessageCircle, BookOpen, Award, Calendar, Activity, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { BadgeDisplay } from "@/components/badge-display"
import { Button } from "@/components/ui/button"
import { getSession } from "@/features/auth/services/getSession"
import { getUserQuestions } from "@/features/questions/services/question.api"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params
  console.log("ProfilePage params id:", id)
  // const [profile, userQuestions, userBadges] = await Promise.all([
  //   getProfile(params.id),
  //   getQuestions({ authorId: params.id }),
  //   getUserBadges(params.id),
  // ])
  const { profile } = await getSession()
  const { data: userQuestions } = await getUserQuestions(id)
  const userBadges  = await getUserBadges(id)
   

  if (!profile) {
    notFound()
  }

  const getBadgeLevel = (reputation: number) => {
    if (reputation >= 1000) return { name: "Expert", color: "text-yellow-500" }
    if (reputation >= 500) return { name: "Advanced", color: "text-blue-500" }
    if (reputation >= 100) return { name: "Intermediate", color: "text-green-500" }
    return { name: "Beginner", color: "text-gray-500" }
  }

  const badge = getBadgeLevel(profile.reputation)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Profile" showBack />

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent rounded-lg p-6 text-center space-y-4">
          <Avatar className="h-24 w-24 mx-auto border-4 border-background">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {profile.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            {profile.full_name && <p className="text-muted-foreground">{profile.full_name}</p>}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Award className={`h-5 w-5 ${badge.color}`} />
            <span className={`font-semibold ${badge.color}`}>{badge.name}</span>
          </div>

          {profile.bio && <p className="text-sm text-muted-foreground max-w-md mx-auto">{profile.bio}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href={`/profile/${id}/activity`}>
            <Button variant="outline" className="w-full bg-transparent">
              <Activity className="h-4 w-4 mr-2" />
              View Activity
            </Button>
          </Link>
          <Link href={`/profile/${id}/upvoted`}>
            <Button variant="outline" className="w-full bg-transparent">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Upvoted
            </Button>
          </Link>
        </div>

        {userBadges.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {userBadges.map((ub: any) => (
                <BadgeDisplay key={ub.id} badges={ub.badge} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{profile.reputation}</p>
            <p className="text-xs text-muted-foreground">Reputation</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{userQuestions?.length}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{(userQuestions || []).reduce((sum: number, q: any) => sum + (q.upvotes || 0), 0)}</p>
            <p className="text-xs text-muted-foreground">Upvotes</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <MessageCircle className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{(userQuestions || []).reduce((sum: number, q: any) => sum + (q.comment_count || 0), 0)}</p>
            <p className="text-xs text-muted-foreground">Discussions</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {(userQuestions || []).slice(0, 5).map((question: any) => (
              <Link key={question.id} href={`/community/questions/${question.id}`}>
                <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 mb-1">{question.question_text}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {question.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {question.comment_count}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {question.status}
                        </Badge>
                        <span className="ml-auto">{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Contributions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Recent Contributions</h3>
          {(userQuestions || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No questions submitted yet</p>
          ) : (
            <div className="space-y-3">
              {(userQuestions || []).slice(0, 5).map((question:any) => (
                <Link key={question.id} href={`/community/questions/${question.id}`}>
                  <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <p className="text-sm font-medium line-clamp-2 mb-2">{question.question_text}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {question.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {question.comment_count}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {question.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav userRole={profile.role} />
    </div>
  )
}
