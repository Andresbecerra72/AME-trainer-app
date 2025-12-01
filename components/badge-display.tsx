import { Award, Shield, Star, Trophy, Zap } from "lucide-react"

interface BadgeDisplayProps {
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    color: string
  }>
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) {
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
    return icons[iconName] || Award
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {badges.map((badge) => {
        const Icon = getIcon(badge.icon)
        return (
          <div
            key={badge.id}
            className="flex flex-col items-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3`}
              style={{ backgroundColor: badge.color + "20" }}
            >
              <Icon className="h-8 w-8" style={{ color: badge.color }} />
            </div>
            <h3 className="font-semibold text-sm text-center mb-1">{badge.name}</h3>
            <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
          </div>
        )
      })}
    </div>
  )
}
