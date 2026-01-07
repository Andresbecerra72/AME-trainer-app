import { redirect } from "next/navigation"
import { getPendingQuestions } from "@/features/questions/services/pendingQuestion.api"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { PendingQuestionCard } from "@/features/questions/components/PendingQuestionCard"

export const revalidate = 0 // Disable caching for this page

export default async function PendingQuestionsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/protected/dashboard")
  }

  // Fetch pending questions (business logic moved to feature API)
  const pendingQuestions = await getPendingQuestions()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      <MobileHeader title="Pending Questions" showBack />

      <div className="p-4 space-y-4">
        {/* Stats Header */}
        {pendingQuestions && pendingQuestions.length > 0 && (
          <Card className="border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{pendingQuestions.length}</p>
                <p className="text-sm text-muted-foreground">Questions awaiting review</p>
              </div>
            </CardContent>
          </Card>
        )}

        {pendingQuestions && pendingQuestions.length > 0 ? (
          <div className="space-y-4">
            {pendingQuestions.map((question) => (
              <PendingQuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">All Caught Up!</p>
                  <p className="text-sm text-muted-foreground">No pending questions to review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
