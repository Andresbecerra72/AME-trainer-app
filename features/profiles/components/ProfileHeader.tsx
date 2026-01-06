import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award } from "lucide-react"
import type { BadgeLevel } from "../utils/profile.utils"

interface ProfileHeaderProps {
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  badgeLevel: BadgeLevel
}

export function ProfileHeader({ displayName, email, avatarUrl, badgeLevel }: ProfileHeaderProps) {
  const name = displayName || email || "User"
  
  return (
    <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl p-6 sm:p-8 text-center space-y-4 border border-primary/20 shadow-lg">
      <div className="relative inline-block">
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 mx-auto border-4 border-background shadow-xl">
          <AvatarImage src={avatarUrl || undefined} className="object-cover" />
          <AvatarFallback className="text-2xl sm:text-3xl bg-primary text-primary-foreground font-bold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-2 -right-2 rounded-full p-2 bg-background border-2 shadow-lg ${badgeLevel.color}`}>
          <Award className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold">{name}</h2>
        {displayName && email && <p className="text-sm sm:text-base text-muted-foreground">{email}</p>}
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/30 shadow-md">
        <Award className={`h-4 w-4 sm:h-5 sm:w-5 ${badgeLevel.color}`} />
        <span className={`font-semibold text-sm sm:text-base ${badgeLevel.color}`}>
          {badgeLevel.name}
        </span>
      </div>
    </div>
  )
}
