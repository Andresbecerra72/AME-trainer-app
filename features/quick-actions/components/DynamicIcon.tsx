import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

interface DynamicIconProps {
  iconName: string
  className?: string
}

/**
 * Renders a Lucide icon dynamically based on the icon name string
 * Falls back to Circle icon if the icon name is not found
 */
export function DynamicIcon({ iconName, className = "w-5 h-5" }: DynamicIconProps) {
  const IconComponent = (Icons as Record<string, LucideIcon>)[iconName] || Icons.Circle

  return <IconComponent className={className} />
}
