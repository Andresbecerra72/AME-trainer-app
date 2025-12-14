import Link from "next/link"
import { MessageCircle, CheckCircle2, Eye, ThumbsUp, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface CommunityQuestionCardProps {
  question: {
    id: string
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: "A" | "B" | "C" | "D"
    explanation?: string | null
    difficulty: "easy" | "medium" | "hard"
    comments_count?: number
    views_count?: number
    upvotes?: number
    created_at: string
    author?: {
      id: string
      full_name: string | null
      avatar_url: string | null
    } | null
    topic?: {
      id: string
      name: string
      code: string
    } | null
  }
}

const difficultyColors = {
  easy: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  medium: "bg-amber-500/10 text-amber-600 border-amber-200",
  hard: "bg-rose-500/10 text-rose-600 border-rose-200",
}

export function CommunityQuestionCard({ question }: CommunityQuestionCardProps) {
  const correctOption = question[`option_${question.correct_answer.toLowerCase()}` as keyof typeof question] as string
  const authorName = question.author?.full_name || "Anonymous"
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/community/questions/${question.id}`}>
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:shadow-md group">
        {/* Compact Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-muted/30 to-transparent border-b">
          <Avatar className="h-7 w-7">
            <AvatarImage src={question.author?.avatar_url || ""} alt={authorName} />
            <AvatarFallback className="text-[10px]">{authorInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate">{authorName}</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {new Date(question.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {question.topic && (
              <Badge variant="outline" className="h-5 text-[10px] px-1.5 bg-primary/5">
                {question.topic.code}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`h-5 text-[10px] px-1.5 border ${difficultyColors[question.difficulty]}`}
            >
              {question.difficulty}
            </Badge>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-3 space-y-3">
          <h3 className="font-medium text-sm leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
            {question.question_text}
          </h3>

          {/* Correct Answer Only */}
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800 p-2.5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                  {correctOption}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{question.comments_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{question.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{question.upvotes || 0}</span>
              </div>
            </div>
            <span className="text-[10px] text-primary/60">Click to view details →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
