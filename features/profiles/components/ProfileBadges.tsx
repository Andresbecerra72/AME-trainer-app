import { BadgeDisplay } from "@/components/badge-display"
import { Award } from "lucide-react"

interface ProfileBadgesProps {
  badges: any[]
}

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  if (badges.length === 0) return null

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        Achievements
        <span className="ml-auto text-xs sm:text-sm text-muted-foreground font-normal">
          {badges.length} {badges.length === 1 ? "badge" : "badges"}
        </span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {badges.map((ub: any) => (
          <BadgeDisplay key={ub.id} badges={ub.badge} />
        ))}
      </div>
    </div>
  )
}
