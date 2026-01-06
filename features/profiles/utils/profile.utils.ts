export interface BadgeLevel {
  name: string
  color: string
}

export function getBadgeLevel(reputation: number): BadgeLevel {
  if (reputation >= 1000) return { name: "Expert", color: "text-yellow-500" }
  if (reputation >= 500) return { name: "Advanced", color: "text-blue-500" }
  if (reputation >= 100) return { name: "Intermediate", color: "text-green-500" }
  return { name: "Beginner", color: "text-gray-500" }
}
