import { getQuestions } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { GitMerge } from "lucide-react"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { DuplicatesFilterTabs } from "@/components/duplicates-filter-tabs"

export default async function DuplicatesPage() {
  try {
    const { user, role } = await getSession()
    
    if (!user) {
      redirect("/public/auth/login")
    }
  
    if (!role || !["admin", "super_admin"].includes(role)) {
      redirect("/protected/dashboard")
    }

    // Get approved questions with limit to avoid performance issues
    const questions = await getQuestions({ status: "approved", limit: 200 })

    if (!questions || questions.length === 0) {
      return (
        <div className="min-h-screen bg-background pb-24">
          <MobileHeader title="Potential Duplicates" showBack />
          <div className="text-center py-12">
            <GitMerge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No approved questions found</p>
          </div>
          <BottomNav userRole={role} />
        </div>
      )
    }

    // Improved similarity detection with better word filtering
    const potentialDuplicates: Array<{
      question1: typeof questions[0]
      question2: typeof questions[0]
      similarity: number
    }> = []

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      // Compare only with next questions to avoid duplicates
      for (let j = i + 1; j < questions.length; j++) {
        const other = questions[j]
        
        // Filter out common words and keep significant ones
        const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being'])
        const words1 = question.question_text.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))
        const words2 = other.question_text.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))
        
        const commonWords = words1.filter((w) => words2.includes(w))
        const similarity = Math.round((commonWords.length / Math.max(words1.length, words2.length)) * 100)

        // Threshold: at least 40% similarity
        if (similarity >= 40) {
          potentialDuplicates.push({
            question1: question,
            question2: other,
            similarity,
          })
        }
      }
    }

    // Sort by similarity descending
    potentialDuplicates.sort((a, b) => b.similarity - a.similarity)

    return (
      <div className="min-h-screen bg-background pb-24">
        <MobileHeader title="Duplicate Detection" showBack />

        <div className="p-4 space-y-4">
          {potentialDuplicates.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <GitMerge className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Duplicates Detected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                All approved questions appear to be unique. Great job maintaining quality content!
              </p>
            </div>
          ) : (
            <DuplicatesFilterTabs duplicates={potentialDuplicates} />
          )}
        </div>

        <BottomNav userRole={role} />
      </div>
    )
  } catch (error) {
    console.error("Error in duplicates page:", error)
    return (
      <div className="min-h-screen bg-background pb-24">
        <MobileHeader title="Duplicate Detection" showBack />
        <div className="p-4">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
            <p className="text-sm font-medium text-destructive mb-1">Error loading duplicates</p>
            <p className="text-xs text-muted-foreground">
              Unable to analyze questions. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
