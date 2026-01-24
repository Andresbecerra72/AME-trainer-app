import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, User } from "lucide-react"

interface QuestionPreviewCardProps {
  question: {
    id: string
    question_text: string
    author?: {
      full_name?: string | null
    } | null
    topic?: {
      code: string
    } | null
    upvotes?: number
    comments_count?: number
  }
  showAuthor?: boolean
}

export function QuestionPreviewCard({ question, showAuthor = true }: QuestionPreviewCardProps) {
  return (
    <Link href={`/protected/community/questions/${question.id}`} className="block group">
      <div className="relative rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        {/* Topic Badge - Top Right */}
        {question.topic && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 text-[10px] font-mono bg-primary/10 text-primary border-primary/20"
          >
            {question.topic.code}
          </Badge>
        )}

        {/* Question Text */}
        <h3 className="font-medium text-sm sm:text-base leading-relaxed line-clamp-2 mb-3 pr-16 group-hover:text-primary transition-colors">
          {question.question_text}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {showAuthor && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">
                {question.author?.full_name || "Anonymous"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{question.upvotes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{question.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
