import { Award, Shield, Star, Trophy, Zap } from "lucide-react"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

interface BadgeDisplayProps {
  badges: Badge | Badge[]
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  // Convert to array if single badge
  const badgeArray = Array.isArray(badges) ? badges : [badges]

  if (!badgeArray || badgeArray.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No badges earned yet</p>
      </div>
    )
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      award: Award,
      shield: Shield,
      star: Star,
      trophy: Trophy,
      zap: Zap,
    }
    return icons[iconName.toLowerCase()] || Award
  }

  return (
    <>
      {badgeArray.map((badge) => {
        const Icon = getIcon(badge.icon)
        return (
          <div
            key={badge.id}
            className="group relative inline-flex flex-col items-center p-3 sm:p-4 rounded-lg border bg-card hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            title={badge.description}
          >
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
              style={{ backgroundColor: badge.color + "20" }}
            >
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: badge.color }} />
            </div>
            <h3 className="font-semibold text-xs sm:text-sm text-center line-clamp-1">{badge.name}</h3>
            <p className="text-xs text-muted-foreground text-center line-clamp-2 hidden sm:block mt-1">
              {badge.description}
            </p>
          </div>
        )
      })}
    </>
  )
}
