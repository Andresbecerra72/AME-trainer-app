import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Star, MessageCircle, Clock } from "lucide-react"
import type { UpvotedQuestion } from "../services/votes.api"

interface UpvotedQuestionCardProps {
  question: UpvotedQuestion
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function UpvotedQuestionCard({ question }: UpvotedQuestionCardProps) {
  return (
    <Link href={`/protected/community/questions/${question.id}`}>
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
        <div className="space-y-3">
          {/* Topic Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {question.topic.code}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Upvoted {formatDate(question.upvoted_at)}
            </span>
          </div>

          {/* Question Text */}
          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {question.question_text}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              {question.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3 text-blue-500" />
              {question.comment_count}
            </span>
            <Badge variant="outline" className="text-xs capitalize">
              {question.status}
            </Badge>
            {question.author.display_name && (
              <span className="ml-auto hidden sm:inline">
                by {question.author.display_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
