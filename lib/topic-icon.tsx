import type { ReactNode } from "react"
import * as LucideIcons from "lucide-react"

function normalizeIconName(name: string): string {
  return name
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

function getLucideIcon(iconName: string) {
  const direct = (LucideIcons as any)[iconName]
  if (direct) return direct

  const normalized = normalizeIconName(iconName)
  return (LucideIcons as any)[normalized]
}

export function renderTopicIcon(iconName?: string | null, className = "h-6 w-6"): ReactNode {
  if (!iconName) return <LucideIcons.Book className={className} />

  if (/\p{Extended_Pictographic}/u.test(iconName)) {
    return <span className="text-2xl">{iconName}</span>
  }

  const IconComponent = getLucideIcon(iconName)
  if (IconComponent) return <IconComponent className={className} />

  return <LucideIcons.Book className={className} />
}
