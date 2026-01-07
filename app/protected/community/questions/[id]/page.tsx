import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bookmark, Flag, CheckCircle, MessageSquare, AlertTriangle } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { ShareButton } from "@/components/share-button"
import { VoteControls } from "@/components/vote-controls"
import { getSession } from "@/features/auth/services/getSession"
import { getQuestionById } from "@/features/questions/services/question.server"
import { createAddCommentHandler, getCommentsByQuestionId } from "@/features/comments/services/comments.server"
import { createToggleBookmarkHandler, isBookmarkedByUser } from "@/features/bookmarks/services/bookmarks.server"
import { createReportQuestionHandler, hasUserReportedQuestion, getQuestionReportsCount } from "@/features/reports/services/reports.server"
import { getUserVoteOnQuestion, getQuestionVoteCounts } from "@/features/votes/services/user-vote.api"
import { ReportDialog } from "@/features/reports/components/report-dialog"

export default async function QuestionDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const { user, role } = await getSession()

  // Fetch question and comments via feature API
  const question = await getQuestionById(id)
  if (!question) notFound()

  const comments = await getCommentsByQuestionId(id)

  // Check if user has bookmarked
  let isBookmarked = false
  let hasReported = false
  let userVote: number | undefined
  if (user) {
    isBookmarked = await isBookmarkedByUser(user.id, id)
    hasReported = await hasUserReportedQuestion(user.id, id)
    userVote = await getUserVoteOnQuestion(id)
  }

  // Get reports count and vote counts
  const reportsCount = await getQuestionReportsCount(id)
  const { upvotes, downvotes } = await getQuestionVoteCounts(id)

  const isAuthor = user && question.author_id === user.id
  const canEdit = isAuthor || role === "admin" || role === "super_admin"

  // Server action handlers bound to this question id
  const addComment = createAddCommentHandler(id)
  const toggleBookmark = createToggleBookmarkHandler(id)
  const reportQuestion = createReportQuestionHandler(id)

  const isCorrect = (option: string) => option === question.correct_answer
  const showInconsistentWarning = question.is_inconsistent

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Question Details" showBack />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Question Card */}
        <MobileCard>
          <div className="space-y-4">
            {/* Author Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={question.author?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{question.author?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link href={`/protected/profile/${question.author_id}`} className="font-medium hover:underline">
                    {question.author?.full_name || "Anonymous"}
                  </Link>
                  <p className="text-xs text-muted-foreground">{new Date(question.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {question.topic && (
                  <Badge variant="secondary" className="text-xs">
                    {question.topic.name} - {question.topic.code}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {question.difficulty}
                </Badge>
                {reportsCount > 0 && (
                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {reportsCount} {reportsCount === 1 ? "Report" : "Reports"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-balance leading-relaxed mb-4">{question.question_text}</h2>

              {/* Options */}
              <div className="space-y-2 sm:space-y-2.5">
                {["A", "B", "C", "D"].map((option) => {
                  const optionKey = `option_${option.toLowerCase()}` as keyof typeof question
                  const optionText = question[optionKey] as string

                  return (
                    <div
                      key={option}
                      className={`p-3 sm:p-4 rounded-lg border ${
                        isCorrect(option)
                          ? "bg-green-50 border-green-500 dark:bg-green-950/30"
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-2">
                        <span className="font-semibold flex-shrink-0">{option}.</span>
                        <span className="flex-1 text-sm sm:text-base">{optionText}</span>
                        {isCorrect(option) && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <p className="text-sm font-medium mb-1.5">Explanation:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:flex gap-2 pt-2 border-t">
              <form action={toggleBookmark} className="sm:flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Bookmark className={`h-4 w-4 sm:mr-1 ${isBookmarked ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
                </Button>
              </form>
              {canEdit && (
                <Button variant="outline" size="sm" className="sm:flex-1" asChild>
                  <Link href={`/protected/community/questions/${id}/edit`}>
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </Link>
                </Button>
              )}
              <div className="sm:flex-1">
                <ShareButton
                  title={question.question_text}
                  text="Check out this AME exam question"
                  url={`/protected/community/questions/${id}`}
                  variant="outline"
                  size="sm"
                />
              </div>
              <ReportDialog reportAction={reportQuestion} hasReported={hasReported} />
            </div>

            {/* Voting and Stats */}
            <div className="flex items-center justify-between pt-2 border-t">
              <VoteControls
                questionId={id}
                upvotes={upvotes}
                downvotes={downvotes}
                userVote={userVote}
              />
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{comments?.length || 0}</span>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Comments Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-base sm:text-lg">Discussion ({comments?.length || 0})</h3>

          {/* Add Comment Form */}
          {user ? (
            <form action={addComment} className="space-y-2">
              <Textarea name="content" placeholder="Add to the discussion..." rows={3} className="text-sm sm:text-base" required />
              <Button type="submit" size="sm" className="w-full sm:w-auto sm:px-8">
                Post Comment
              </Button>
            </form>
          ) : (
            <MobileCard className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Sign in to join the discussion</p>
              <Link href="/public/auth/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </MobileCard>
          )}

          {/* Comments List */}
          {comments && comments.length > 0 ? (
            <div className="space-y-3 sm:space-y-3.5">
              {comments.map((comment) => (
                <MobileCard key={comment.id}>
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                      <AvatarImage src={comment.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{comment.user?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <Link href={`/protected/profile/${comment.user_id}`} className="font-medium text-sm hover:underline">
                          {comment.user?.full_name || "Anonymous"}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
