import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Award, Bookmark, MessageSquare, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { AnnouncementBanner } from "@/components/announcement-banner"
import { getActiveAnnouncements, getStudyStreak, getRecommendedQuestions } from "@/lib/db-actions"
import { StudyStreakWidget } from "@/components/study-streak-widget"
import { getSession } from "@/features/auth/services/getSession"
import { getUserQuestions } from "@/features/questions/services/question.api"
import { getUserComments } from "@/features/comments/services/comments.api"
import { getRecentQuestions } from "@/features/questions/services/question.server"
import { getUserBookmarks } from "@/features/bookmarks/services/bookmarks.api"
import { getUserUnreadNotifications } from "@/features/notifications/services/notifications.server"
import { StatCard } from "@/features/dashboard/components/StatCard"
import { QuestionPreviewCard } from "@/features/dashboard/components/QuestionPreviewCard"
import { ActionCard } from "@/features/dashboard/components/ActionCard"
import { getQuickActionsForRole } from "@/features/quick-actions/services/quick-actions.api"
import * as Icons from "lucide-react"

export default async function DashboardPage() {
  const { user, profile, role } = await getSession() 

  if (!user) {
    redirect("/public/auth/login")
  }
  
  // Fetch user stats
  const { data: userQuestions } = await getUserQuestions(user.id)
  const { data: userComments } = await getUserComments(user.id)
  const { count: bookmarks } = await getUserBookmarks(user.id)

  // Fetch unread notifications count
  const { count: unreadNotifications } = await getUserUnreadNotifications(user.id)
    
  // Fetch Quick Actions for current role
  const quickActions = await getQuickActionsForRole(role)

  // Transform quick actions to match ActionCard props
  const mainCards = quickActions.map((action) => {
    // Dynamically get the icon component from lucide-react
    const IconComponent = (Icons as any)[action.icon] || Icons.Circle
    
    return {
      title: action.title,
      description: action.description,
      icon: IconComponent,
      color: action.color,
      bgColor: action.bg_color,
      path: action.path,
    }
  })

  // Fetch recent community questions
  const recentQuestions  = await getRecentQuestions()    

  const announcements = await getActiveAnnouncements()
  const streak = await getStudyStreak(user.id)
  const recommendations = await getRecommendedQuestions(user.id, 3)

  const stats = [
    { 
      label: "Reputation", 
      value: profile?.reputation || 0, 
      icon: Award,
      gradient: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
    },
    { 
      label: "Questions", 
      value: userQuestions?.length || 0, 
      icon: MessageSquare,
      gradient: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
    },
    { 
      label: "Bookmarks", 
      value: bookmarks || 0, 
      icon: Bookmark, 
      href: "/protected/bookmarks",
      gradient: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <p className="text-primary-foreground/90 text-sm sm:text-base">
            Welcome back, <span className="font-semibold">{profile?.full_name || "User"}</span>! 
            Ready to continue learning?
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 space-y-6 sm:space-y-8">
        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <AnnouncementBanner announcements={announcements} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-in fade-in slide-in-from-bottom-2"
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Study Streak */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <StudyStreakWidget 
            currentStreak={streak.current_streak} 
            longestStreak={streak.longest_streak} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Recommended Questions */}
            {recommendations.length > 0 && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-500 delay-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">Recommended for You</h2>
                  </div>
                  <Link 
                    href="/protected/recommendations" 
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                  >
                    View all
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  {recommendations.slice(0, 3).map((question, index) => (
                    <div
                      key={question.id}
                      style={{ animationDelay: `${(index + 5) * 100}ms` }}
                      className="animate-in fade-in slide-in-from-left-2"
                    >
                      <QuestionPreviewCard question={question} showAuthor={false} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Community Questions */}
            {recentQuestions && recentQuestions.length > 0 && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-500 delay-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Recent Questions</h2>
                  <Link 
                    href="/protected/community" 
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                  >
                    View all
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  {recentQuestions.slice(0, 3).map((question, index) => (
                    <div
                      key={question.id}
                      style={{ animationDelay: `${(index + 8) * 100}ms` }}
                      className="animate-in fade-in slide-in-from-left-2"
                    >
                      <QuestionPreviewCard question={question} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Quick Actions (Primary 4) */}
          <div className="lg:col-span-1 space-y-6">
            <section className="animate-in fade-in slide-in-from-right-4 duration-500 delay-600">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                {mainCards.slice(0, 4).map((card, index) => (
                  <div
                    key={card.title}
                    style={{ animationDelay: `${(index + 6) * 100}ms` }}
                    className="animate-in fade-in slide-in-from-right-2"
                  >
                    <ActionCard {...card} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Additional Quick Actions - Full Width */}
        {mainCards.length > 4 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-900">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">More Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {mainCards.slice(4).map((card, index) => (
                <div
                  key={card.title}
                  style={{ animationDelay: `${(index + 10) * 100}ms` }}
                  className="animate-in fade-in slide-in-from-bottom-2"
                >
                  <ActionCard {...card} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav userRole={role} unreadNotifications={unreadNotifications || 0} />
    </div>
  )
}
