"use client"

import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { CheckCircle2, XCircle, Circle, TrendingUp } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProgressBar } from "@/components/progress-bar"
import { useEffect, useState } from "react"
import { saveExamHistory } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"

interface ExamResults {
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  timeSpent: number
  topicPerformance: {
    topic: string
    correct: number
    total: number
    percentage: number
  }[]
  userAnswers: { questionId: string; userAnswer: string | null }[]
}

export default function ExamResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<ExamResults | null>(null)
  const { toast } = useToast()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Get results from URL params or sessionStorage
    const resultsParam = searchParams.get("results")
    if (resultsParam) {
      console.log("[ExamResults] Loading from URL params")
      setResults(JSON.parse(decodeURIComponent(resultsParam)))
    } else {
      const stored = sessionStorage.getItem("examResults")
      console.log("[ExamResults] Stored results:", stored)
      if (stored) {
        const parsedResults = JSON.parse(stored)
        console.log("[ExamResults] Parsed results:", parsedResults)
        setResults(parsedResults)
      } else {
        console.log("[ExamResults] No results found, redirecting")
        router.push("/protected/exam/setup")
      }
    }
  }, [searchParams, router])

  useEffect(() => {
    if (results && !saved) {
      // Obtener topicIds desde results (ya incluidos desde ExamRunClient)
      const topicIds = (results as any).topicIds || []

      console.log("[ExamResults] Saving exam history:", {
        topic_ids: topicIds,
        question_count: results.totalQuestions,
        correct_answers: results.correctAnswers,
        incorrect_answers: results.wrongAnswers,
        score_percentage: results.score,
        time_taken: Math.round(results.timeSpent * 60),
      })

      saveExamHistory({
        topic_ids: topicIds,
        question_count: results.totalQuestions,
        correct_answers: results.correctAnswers,
        incorrect_answers: results.wrongAnswers,
        score_percentage: results.score,
        time_taken: Math.round(results.timeSpent * 60), // Convert minutes to seconds
      })
        .then(() => {
          console.log("[ExamResults] Exam history saved successfully")
          setSaved(true)
        })
        .catch((error) => {
          console.error("[ExamResults] Error saving exam history:", error)
          toast({
            title: "Warning",
            description: "Could not save exam history: " + error.message,
            variant: "destructive",
          })
        })
    }
  }, [results, saved, toast])

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const handleReviewAnswers = () => {
    if (!results) return

    // Guardar toda la data necesaria para review
    const reviewData = {
      userAnswers: results.userAnswers,
      questions: (results as any).questions || [],
      flaggedQuestions: (results as any).flaggedQuestions || [],
    }

    console.log("[ExamResults] Saving review data:", reviewData)
    sessionStorage.setItem("examReview", JSON.stringify(reviewData))
    router.push("/protected/exam/review")
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Exam Results" showBack={false} />

      <div className="p-6 space-y-6 max-w-2xl mx-auto pb-24">
        {/* Score Card */}
        <MobileCard className="text-center space-y-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground">
            <span className="text-3xl font-bold">{results.score}%</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {results.score >= 80 ? "Great Job!" : results.score >= 60 ? "Good Effort!" : "Keep Practicing!"}
            </h2>
            <p className="text-muted-foreground">
              You scored {results.correctAnswers} out of {results.totalQuestions}
            </p>
          </div>
        </MobileCard>

        {/* Summary Stats */}
        <MobileCard className="space-y-4">
          <h3 className="font-semibold text-foreground">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{results.correctAnswers}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{results.wrongAnswers}</div>
              <div className="text-xs text-muted-foreground">Wrong</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Circle className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">{results.skippedAnswers}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Spent</span>
              <span className="font-medium text-foreground">{results.timeSpent.toFixed(1)} minutes</span>
            </div>
          </div>
        </MobileCard>

        {/* Topic Performance */}
        {results.topicPerformance.length > 0 && (
          <MobileCard className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Performance by Topic</h3>
            </div>
            <div className="space-y-4">
              {results.topicPerformance.map((topic, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">{topic.topic}</span>
                    <span className="text-muted-foreground">
                      {topic.correct}/{topic.total} correct
                    </span>
                  </div>
                  <ProgressBar
                    value={topic.percentage}
                    showPercentage={false}
                    color={topic.percentage >= 80 ? "success" : topic.percentage >= 60 ? "warning" : "danger"}
                  />
                </div>
              ))}
            </div>
          </MobileCard>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
          <div className="max-w-2xl mx-auto space-y-3">
            <PrimaryButton onClick={handleReviewAnswers} fullWidth>
              Review Answers
            </PrimaryButton>
            <div className="grid grid-cols-2 gap-3">
              <SecondaryButton onClick={() => router.push("/protected/exam/setup")}>Retake Exam</SecondaryButton>
              <SecondaryButton onClick={() => router.push("/protected/dashboard")}>Home</SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
