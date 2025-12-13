import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bookmark, Flag, CheckCircle, ThumbsUp, MessageSquare, AlertTriangle } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { ShareButton } from "@/components/share-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getSession } from "@/features/auth/services/getSession"
import { getQuestionById } from "@/features/questions/services/question.server"
import { createAddCommentHandler, getCommentsByQuestionId } from "@/features/comments/services/comments.server"
import { createToggleBookmarkHandler, isBookmarkedByUser } from "@/features/bookmarks/services/bookmarks.server"
import { createReportQuestionHandler } from "@/features/reports/services/reports.server"

export default async function QuestionDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const { user, role } = await getSession()

  // Fetch question and comments via feature API
  const question = await getQuestionById(id)
  if (!question) notFound()

  const comments = await getCommentsByQuestionId(id)

  // Check if user has bookmarked
  let isBookmarked = false
  if (user) {
    isBookmarked = await isBookmarkedByUser(user.id, id)
  }

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

      <div className="p-4 space-y-6">
        {/* Question Card */}
        <MobileCard>
          <div className="space-y-4">
            {/* Author Info */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={question.author?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{question.author?.full_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${question.author_id}`} className="font-medium hover:underline">
                  {question.author?.full_name || "Anonymous"}
                </Link>
                <p className="text-xs text-muted-foreground">{new Date(question.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                {question.topic && (
                  <Badge variant="secondary" className="text-xs">
                    {question.topic.name} - {question.topic.code}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {question.difficulty}
                </Badge>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <h2 className="text-lg font-semibold text-balance leading-relaxed mb-4">{question.question_text}</h2>

              {/* Options */}
              <div className="space-y-2">
                {["A", "B", "C", "D"].map((option) => {
                  const optionKey = `option_${option.toLowerCase()}` as keyof typeof question
                  const optionText = question[optionKey] as string

                  return (
                    <div
                      key={option}
                      className={`p-3 rounded-lg border ${
                        isCorrect(option)
                          ? "bg-green-50 border-green-500 dark:bg-green-950/30"
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{option}.</span>
                        <span className="flex-1">{optionText}</span>
                        {isCorrect(option) && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Explanation:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <form action={toggleBookmark} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
              </form>
              {canEdit && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/community/questions/${id}/edit`}>Edit</Link>
                </Button>
              )}
              <ShareButton
                title={question.question_text}
                text="Check out this AME exam question"
                url={`/community/questions/${id}`}
                variant="outline"
                size="sm"
              />
              {/* Report Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Question</DialogTitle>
                    <DialogDescription>
                      Help us maintain quality by reporting issues with this question.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={reportQuestion} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <select id="reason" name="reason" className="w-full p-2 border rounded-md bg-background" required>
                        <option value="">Select a reason</option>
                        <option value="incorrect">Incorrect Answer</option>
                        <option value="duplicate">Duplicate Question</option>
                        <option value="spam">Spam</option>
                        <option value="inappropriate">Inappropriate Content</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Provide additional details..."
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        Submit Report
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{question.votes || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{comments?.length || 0} comments</span>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Question Card */}
        

        {/* Comments Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Discussion ({comments?.length || 0})</h3>

          {/* Add Comment Form */}
          {user ? (
            <form action={addComment} className="space-y-2">
              <Textarea name="content" placeholder="Add to the discussion..." rows={3} required />
              <Button type="submit" size="sm" className="w-full">
                Post Comment
              </Button>
            </form>
          ) : (
            <MobileCard className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Sign in to join the discussion</p>
              <Link href="/auth/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </MobileCard>
          )}

          {/* Comments List */}
          {comments && comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <MobileCard key={comment.id}>
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{comment.user?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <Link href={`/profile/${comment.user_id}`} className="font-medium text-sm hover:underline">
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
