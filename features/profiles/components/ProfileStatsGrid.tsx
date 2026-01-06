import { Trophy, Star, MessageCircle, BookOpen } from "lucide-react"
import type { ProfileStats } from "../services/profile.api"

interface ProfileStatsGridProps {
  stats: ProfileStats
}

export function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <StatCard
        icon={<Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
        value={stats.reputation}
        label="Reputation"
        gradient="from-primary/10 to-primary/5"
      />
      <StatCard
        icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />}
        value={stats.totalQuestions}
        label="Questions"
        gradient="from-accent/10 to-accent/5"
      />
      <StatCard
        icon={<Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />}
        value={stats.totalUpvotes}
        label="Upvotes"
        gradient="from-yellow-500/10 to-yellow-500/5"
      />
      <StatCard
        icon={<MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
        value={stats.totalDiscussions}
        label="Discussions"
        gradient="from-blue-500/10 to-blue-500/5"
      />
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  gradient: string
}

function StatCard({ icon, value, label, gradient }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border border-border rounded-lg p-4 sm:p-5 text-center hover:shadow-lg transition-all duration-200 hover:scale-105`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
