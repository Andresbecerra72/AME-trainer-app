import { MobileHeader } from "@/components/mobile-header"
import { EmptyState } from "@/components/empty-state"
import { ThumbsUp } from "lucide-react"
import { notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { getUserUpvotedQuestions } from "@/features/votes/services/votes.api"
import { UpvotedQuestionCard } from "@/features/votes/components/UpvotedQuestionCard"

export default async function UpvotedPage({ params }: { params: { id: string } }) {
  const { id: paramId } = await params
  const { user, profile } = await getSession()

  if (!profile) {
    notFound()
  }

  // Use current user's ID if viewing own profile or if no valid ID provided
  const profileId = paramId && paramId !== "me" ? paramId : user?.id

  if (!profileId) {
    notFound()
  }

  const upvotedQuestions = await getUserUpvotedQuestions(profileId)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Upvoted Questions" showBack />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        <div className="bg-gradient-to-r from-green-500/10 to-primary/10 rounded-lg p-4 sm:p-5 border border-green-500/20">
          <h2 className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            Upvoted Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {upvotedQuestions.length} {upvotedQuestions.length === 1 ? "question" : "questions"} upvoted
          </p>
        </div>

        <div className="space-y-3">
          {upvotedQuestions.length === 0 ? (
            <EmptyState
              icon={ThumbsUp}
              title="No upvoted questions"
              description="Questions you upvote will appear here."
              actionLabel="Browse Questions"
              actionHref="/protected/community"
            />
          ) : (
            upvotedQuestions.map((question) => (
              <UpvotedQuestionCard key={question.id} question={question} />
            ))
          )}
        </div>
      </div>

      <BottomNav userRole={profile.role} />
    </div>
  )
}
