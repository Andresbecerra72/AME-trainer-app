"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle2, XCircle, Target } from "lucide-react"
import Link from "next/link"

export default function ExamResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("examResults")
    if (!stored) {
      router.push("/protected/exams")
      return
    }
    setResults(JSON.parse(stored))
  }, [router])

  if (!results) {
    return <div className="min-h-screen bg-background" />
  }

  const percentage = results.score
  const passed = percentage >= 70

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Exam Results" showBack={false} />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Score Card */}
        <Card
          className={`p-8 text-center ${passed ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}
        >
          <Trophy className={`h-16 w-16 mx-auto mb-4 ${passed ? "text-green-600" : "text-red-600"}`} />
          <h1 className="text-4xl font-bold mb-2">{percentage}%</h1>
          <p className="text-xl font-semibold mb-4">{passed ? "Passed!" : "Keep Practicing"}</p>
          <p className="text-muted-foreground">
            You got {results.correctCount} out of {results.totalQuestions} questions correct
          </p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{results.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{results.correctCount}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </Card>
          <Card className="p-4 text-center">
            <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{results.totalQuestions - results.correctCount}</div>
            <div className="text-xs text-muted-foreground">Incorrect</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href={`/protected/exams/${results.examId}`} className="block">
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              View Exam Details
            </Button>
          </Link>
          <Link href={`/protected/exams/${results.examId}/take`} className="block">
            <Button size="lg" className="w-full">
              Retake Exam
            </Button>
          </Link>
          <Link href="/protected/exams" className="block">
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              Browse More Exams
            </Button>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
