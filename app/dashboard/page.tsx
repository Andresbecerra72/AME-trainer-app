import { redirect } from "next/navigation"
import { MobileCard } from "@/components/mobile-card"
import { BottomNav } from "@/components/bottom-nav"
import {
  Award, 
  Bookmark,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { AnnouncementBanner } from "@/components/announcement-banner"
import { getActiveAnnouncements, getStudyStreak, getRecommendedQuestions } from "@/lib/db-actions"
import { StudyStreakWidget } from "@/components/study-streak-widget"
import { getSession } from "@/features/auth/services/getSession"
import { getUserQuestions } from "@/features/questions/services/question.api"
import { getUserComments } from "@/features/comments/services/comments.api"
import { mainCards } from "./dashboard.mock"
import { getRecentQuestions } from "@/features/questions/services/question.server"
import { getUserBookmarks } from "@/features/bookmarks/services/bookmarks.api"
import { getUsernotifications } from "@/features/notifications/services/notifications.api"

export default async function DashboardPage() {
  console.log(" AQUI Rendering Dashboard Page...");
  const { user, profile } = await getSession()
  // const supabase = await createSupabaseServerClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
 // const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  console.log("DASHBOARD PROFILE:", profile);
  
  // Fetch user stats
  const { data: userQuestions } = await getUserQuestions(user.id)
  const { data: userComments } = await getUserComments(user.id)
  const { data: bookmarks } = await getUserBookmarks(user.id)

  // Fetch unread notifications count
  const { count: unreadNotifications } = await getUsernotifications(user.id)
    

  // Fetch recent community questions
  const recentQuestions  = await getRecentQuestions()    

  const announcements = await getActiveAnnouncements()
  const streak = await getStudyStreak(user.id)
  const recommendations = await getRecommendedQuestions(user.id, 3)

 const stats = [
    { label: "Reputation", value: profile?.reputation || 0, icon: Award },
    { label: "Questions", value: userQuestions?.length || 0, icon: MessageSquare },
    { label: "Bookmarks", value: bookmarks || 0, icon: Bookmark },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-primary-foreground/80">Welcome back, {profile?.display_name || "User"}!</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-4">
        {announcements && announcements.length > 0 && (
          <div className="mb-6">
            <AnnouncementBanner announcements={announcements} />
          </div>
        )}

        {/* Study Streak Widget */}
        <div className="mb-6">
          <StudyStreakWidget currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />
        </div>

        {/* Quick Stats */}
        <MobileCard className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </MobileCard>

        {/* Recommended Questions Preview */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold">Recommended for You</h2>
              </div>
              <Link href="/recommendations" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {recommendations.slice(0, 2).map((question) => (
                <Link key={question.id} href={`/community/questions/${question.id}`}>
                  <MobileCard className="hover:border-primary transition-colors">
                    <p className="text-sm font-medium line-clamp-2">{question.question_text}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      {question.topic && <span className="text-primary font-medium">{question.topic.code}</span>}
                    </div>
                  </MobileCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Action Cards */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground px-1">Main Menu</h2>
          <div className="grid grid-cols-2 gap-4">
            {mainCards.map((card) => {
              const Icon = card.icon
              return (
                <Link key={card.title} href={card.path}>
                  <MobileCard className="space-y-3 hover:border-primary transition-colors h-full">
                    <div className={`${card.bgColor} p-3 rounded-xl inline-block`}>
                      <Icon className={`w-7 h-7 ${card.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                    </div>
                  </MobileCard>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Community Questions */}
        {recentQuestions && recentQuestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-foreground">Recent Questions</h2>
              <Link href="/community" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentQuestions.map((question) => (
                <Link key={question.id} href={`/community/questions/${question.id}`}>
                  <MobileCard className="hover:border-primary transition-colors">
                    <div className="space-y-2">
                      <h3 className="font-medium text-balance leading-relaxed line-clamp-2">
                        {question.question_text}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{question.author?.display_name || "Anonymous"}</span>
                        {question.topic && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">{question.topic.code}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{question.upvotes || 0} votes</span>
                      </div>
                    </div>
                  </MobileCard>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav userRole={profile?.role} unreadNotifications={unreadNotifications || 0} />
    </div>
  )
}
