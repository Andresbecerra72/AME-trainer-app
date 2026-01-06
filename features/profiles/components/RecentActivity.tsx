import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Star, MessageCircle, BookOpen } from "lucide-react"

interface Question {
  id: string
  question_text: string
  upvotes: number
  comment_count: number
  status: string
  created_at: string
}

interface RecentActivityProps {
  questions: Question[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function RecentActivity({ questions }: RecentActivityProps) {
  const recentQuestions = questions.slice(0, 5)

  if (recentQuestions.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-base sm:text-lg">Recent Activity</h3>
        <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No activity yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-semibold text-base sm:text-lg">Recent Activity</h3>
      <div className="space-y-2 sm:space-y-3">
        {recentQuestions.map((question) => (
          <Link key={question.id} href={`/protected/community/questions/${question.id}`}>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {question.question_text}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {question.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {question.comment_count}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {question.status}
                    </Badge>
                    <span className="ml-auto hidden sm:inline">{formatDate(question.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
