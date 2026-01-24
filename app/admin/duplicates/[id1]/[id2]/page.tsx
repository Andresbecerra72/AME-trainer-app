import { getQuestion, mergeQuestions } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { getSession } from "@/features/auth/services/getSession"

async function handleMerge(sourceId: string, targetId: string) {
  "use server"
  await mergeQuestions(sourceId, targetId)
  revalidatePath("/admin/duplicates")
  redirect("/admin/duplicates")
}

export default async function MergeDuplicatesPage({ params }: { params: Promise<{ id1: string; id2: string }> }) {
  const { user, role } = await getSession()
    
  if (!user) {
    redirect("/public/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/protected/dashboard")
  }

  // Unwrap params Promise (Next.js 15+)
  const resolvedParams = await params
  const [question1, question2] = await Promise.all([getQuestion(resolvedParams.id1), getQuestion(resolvedParams.id2)])

  if (!question1 || !question2) {
    redirect("/admin/duplicates")
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <MobileHeader title="Merge Duplicates" showBack />

      <div className="p-4 space-y-6">
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-sm font-medium">Choose which question to keep</p>
          <p className="text-xs text-muted-foreground mt-1">
            All votes and comments will be transferred to the kept question
          </p>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge>Question 1</Badge>
              <form action={handleMerge.bind(null, resolvedParams.id2, resolvedParams.id1)}>
                <Button size="sm" type="submit">
                  Keep This
                </Button>
              </form>
            </div>
            <div>
              <p className="font-medium mb-2">{question1.question_text}</p>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Author: {question1.author?.full_name}</p>
                <p className="text-muted-foreground">Upvotes: {question1.upvotes}</p>
                <p className="text-muted-foreground">Comments: {question1.comment_count}</p>
                <p className="text-muted-foreground">Difficulty: {question1.difficulty}</p>
              </div>
              <div className="mt-3 space-y-1">
                {[
                  question1.option_a,
                  question1.option_b,
                  question1.option_c,
                  question1.option_d,
                ].map((opt, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx)
                  const isCorrect = optionLetter === question1.correct_answer
                  return (
                    <div
                      key={idx}
                      className={`text-sm p-2 rounded ${isCorrect ? "bg-green-500/10 border border-green-500/50" : "bg-muted/50"}`}
                    >
                      {optionLetter}. {opt}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge>Question 2</Badge>
              <form action={handleMerge.bind(null, resolvedParams.id1, resolvedParams.id2)}>
                <Button size="sm" type="submit">
                  Keep This
                </Button>
              </form>
            </div>
            <div>
              <p className="font-medium mb-2">{question2.question_text}</p>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Author: {question2.author?.full_name}</p>
                <p className="text-muted-foreground">Upvotes: {question2.upvotes}</p>
                <p className="text-muted-foreground">Comments: {question2.comment_count}</p>
                <p className="text-muted-foreground">Difficulty: {question2.difficulty}</p>
              </div>
              <div className="mt-3 space-y-1">
                {[
                  question2.option_a,
                  question2.option_b,
                  question2.option_c,
                  question2.option_d,
                ].map((opt, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx)
                  const isCorrect = optionLetter === question2.correct_answer
                  return (
                    <div
                      key={idx}
                      className={`text-sm p-2 rounded ${isCorrect ? "bg-green-500/10 border border-green-500/50" : "bg-muted/50"}`}
                    >
                      {optionLetter}. {opt}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
