import { getQuestions } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitMerge } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"

export default async function DuplicatesPage() {
  const { user, role } = await getSession()
  
    if (!user) {
      redirect("/public/auth/login")
    }
  
    if (!role || !["admin", "super_admin"].includes(role)) {
      redirect("/protected/dashboard")
    }

  // Get all approved questions
  const questions = await getQuestions({ status: "approved" })

  // Simple similarity detection based on question text
  const potentialDuplicates = questions.reduce((acc, question, index) => {
    for (let i = index + 1; i < questions.length; i++) {
      const other = questions[i]
      // Simple check: if questions share 5+ common words
      const words1 = question.question_text.toLowerCase().split(/\s+/)
      const words2 = other.question_text.toLowerCase().split(/\s+/)
      const commonWords = words1.filter((w) => words2.includes(w) && w.length > 3)

      if (commonWords.length >= 5) {
        acc.push({
          question1: question,
          question2: other,
          similarity: Math.round((commonWords.length / Math.max(words1.length, words2.length)) * 100),
        })
      }
    }
    return acc
  }, [] as any[])

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Potential Duplicates" showBack />

      <div className="p-4 space-y-4">
        {potentialDuplicates.length === 0 ? (
          <div className="text-center py-12">
            <GitMerge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No potential duplicates found</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {potentialDuplicates.length} potential duplicate pairs found
            </p>
            <div className="space-y-4">
              {potentialDuplicates.map((duplicate, index) => (
                <Card key={index} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{duplicate.similarity}% similar</Badge>
                    <Link href={`/admin/duplicates/${duplicate.question1.id}/${duplicate.question2.id}`}>
                      <Button size="sm">
                        <GitMerge className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Question 1</p>
                      <p className="text-sm font-medium">{duplicate.question1.question_text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {duplicate.question1.author?.username} • {duplicate.question1.upvotes} upvotes
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Question 2</p>
                      <p className="text-sm font-medium">{duplicate.question2.question_text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {duplicate.question2.author?.username} • {duplicate.question2.upvotes} upvotes
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
