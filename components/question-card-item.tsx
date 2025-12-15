"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Flag, CheckCircle, AlertCircle } from "lucide-react"
import type { QuestionWithDetails } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { ProbabilityMeter } from "@/components/probability-meter"

interface QuestionCardItemProps {
  question: QuestionWithDetails
  showStatus?: boolean
}

export function QuestionCardItem({ question, showStatus = false }: QuestionCardItemProps) {
  const router = useRouter()
  const score = question.upvotes - question.downvotes

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const statusIcons = {
    pending: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    approved: <CheckCircle className="h-4 w-4 text-green-500" />,
    rejected: <Flag className="h-4 w-4 text-red-500" />,
  }

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/protected/community/questions/${question.id}`)}
    >
      <div className="flex gap-3">
        {/* Vote score */}
        <div className="flex flex-col items-center gap-1 min-w-[3rem]">
          <div className="text-2xl font-bold text-primary">{score}</div>
          <div className="text-xs text-muted-foreground">votes</div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-base flex-1 line-clamp-2">{question.question_text}</h3>
            {showStatus && <div className="flex-shrink-0">{statusIcons[question.status]}</div>}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className={difficultyColors[question.difficulty]}>
              {question.difficulty}
            </Badge>
            {question.topic && (
              <Badge variant="secondary">
                {question.topic.icon} {question.topic.name}
              </Badge>
            )}
            {question.is_featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
          </div>

          {/* Probability Meter */}
          {question.status === "approved" && (
            <ProbabilityMeter
              upvotes={question.upvotes}
              downvotes={question.downvotes}
              commentCount={question.comment_count}
              authorReputation={question.author?.reputation || 0}
            />
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.comment_count}</span>
            </div>
            {question.report_count > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <Flag className="h-4 w-4" />
                <span>{question.report_count}</span>
              </div>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={question.author?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {question.author?.display_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {question.author?.display_name || "Anonymous"} •{" "}
              {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
