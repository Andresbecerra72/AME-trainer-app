"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface ProbabilityMeterProps {
  upvotes: number
  downvotes: number
  commentCount: number
  authorReputation: number
}

export function ProbabilityMeter({ upvotes, downvotes, commentCount, authorReputation }: ProbabilityMeterProps) {
  // Calculate probability based on multiple factors
  const netVotes = upvotes - downvotes
  const totalVotes = upvotes + downvotes

  let probability = 50 // base probability

  // Factor 1: Net votes (0-30 points)
  if (netVotes > 0) {
    probability += Math.min(netVotes * 2, 30)
  } else if (netVotes < 0) {
    probability += Math.max(netVotes * 2, -30)
  }

  // Factor 2: Engagement (0-10 points)
  if (totalVotes > 10) probability += 10
  else if (totalVotes > 5) probability += 5

  // Factor 3: Comments (0-10 points)
  if (commentCount > 5) probability += 10
  else if (commentCount > 2) probability += 5

  // Factor 4: Author reputation (0-10 points)
  if (authorReputation > 500) probability += 10
  else if (authorReputation > 200) probability += 5

  // Clamp between 0 and 100
  probability = Math.max(0, Math.min(100, probability))

  const getColor = () => {
    if (probability >= 70) return "text-green-600"
    if (probability >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getLabel = () => {
    if (probability >= 70) return "High"
    if (probability >= 50) return "Medium"
    return "Low"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Real Exam Likelihood</span>
        </div>
        <Badge variant="outline" className={getColor()}>
          {getLabel()}
        </Badge>
      </div>
      <Progress value={probability} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {probability}% - Based on community engagement and author reputation
      </p>
    </div>
  )
}
