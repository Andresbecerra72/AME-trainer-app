import { redirect } from "next/navigation"
import { getPendingQuestions, approveQuestion, rejectQuestion } from "@/features/questions/services/pendingQuestion.api"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { CheckCircle, XCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"

export default async function PendingQuestionsPage() {
  const { user, profile } = await getSession()

  if (!user) {
    redirect("/auth/login")
  }

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Fetch pending questions (business logic moved to feature API)
  const pendingQuestions = await getPendingQuestions()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Pending Questions" showBack />

      <div className="p-4 space-y-4">
        {pendingQuestions && pendingQuestions.length > 0 ? (
          <div className="space-y-4">
            {pendingQuestions.map((question) => (
              <PendingQuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <MobileCard>
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">No pending questions</p>
            </div>
          </MobileCard>
        )}
      </div>

      <BottomNav userRole={profile.role} />
    </div>
  )
}

function PendingQuestionCard({ question }: { question: any }) {
  return (
    <MobileCard>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-muted-foreground mt-1" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{question.author?.full_name || "Anonymous"}</p>
            <p className="text-xs text-muted-foreground">{new Date(question.created_at).toLocaleString()}</p>
          </div>
          {question.topic && (
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0">
              {question.topic.code}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-balance leading-relaxed mb-2">{question.question_text}</h3>
          {question.explanation && (
            <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
          )}
        </div>

        {question.options && (
          <div className="space-y-2">
            {(question.options as any[]).map((option, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  option === question.correct_answer ? "bg-green-500/10 border-green-500" : "bg-muted"
                }`}
              >
                <p className="text-sm">{option}</p>
              </div>
            ))}
          </div>
        )}

        <form className="flex gap-2">
          <input type="hidden" name="questionId" value={question.id} />
          <Button formAction={approveQuestion} className="flex-1" variant="default">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button formAction={rejectQuestion} className="flex-1" variant="destructive">
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </form>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Add rejection reason</summary>
          <Textarea
            name="reason"
            placeholder="Explain why this question is being rejected..."
            className="mt-2"
            rows={3}
          />
        </details>
      </div>
    </MobileCard>
  )
}
