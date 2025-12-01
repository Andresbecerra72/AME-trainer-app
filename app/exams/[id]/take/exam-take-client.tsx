"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/progress-bar"
import { Clock, Flag, ChevronLeft, ChevronRight } from "lucide-react"
import { createExamAttempt } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"

interface ExamTakeClientProps {
  exam: any
  questions: any[]
  userId: string
}

export function ExamTakeClient({ exam, questions, userId }: ExamTakeClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(exam.time_limit ? exam.time_limit * 60 : null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Timer
  useEffect(() => {
    if (timeRemaining === null) return

    if (timeRemaining <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }))
  }

  const toggleFlag = () => {
    setFlagged((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex)
      } else {
        newSet.add(currentQuestionIndex)
      }
      return newSet
    })
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const answeredCount = Object.keys(answers).length
    if (answeredCount < questions.length) {
      const confirmed = confirm(
        `You have answered ${answeredCount} out of ${questions.length} questions. Submit anyway?`,
      )
      if (!confirmed) return
    }

    setIsSubmitting(true)

    // Calculate score
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / questions.length) * 100)

    // Save attempt
    const result = await createExamAttempt(exam.id, userId, score, answers)

    if (result.success) {
      // Store results in sessionStorage for results page
      sessionStorage.setItem(
        "examResults",
        JSON.stringify({
          examId: exam.id,
          examTitle: exam.title,
          questions,
          answers,
          score,
          correctCount,
          totalQuestions: questions.length,
        }),
      )

      router.push(`/exams/${exam.id}/results`)
    } else {
      toast({
        title: "Error",
        description: "Failed to submit exam",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title={exam.title} showBack={false} />

      {/* Timer and Progress */}
      <div className="bg-muted/50 border-b px-6 py-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 font-mono font-semibold">
              <Clock className="h-4 w-4" />
              <span className={timeRemaining < 60 ? "text-destructive" : ""}>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        <ProgressBar progress={progress} />
      </div>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <Card className="p-6 space-y-6">
          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-balance leading-relaxed">{currentQuestion.question_text}</h2>
              <Button
                variant={flagged.has(currentQuestionIndex) ? "default" : "outline"}
                size="sm"
                onClick={toggleFlag}
                className="shrink-0"
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>

            {currentQuestion.topic && (
              <div className="text-sm text-muted-foreground">
                Topic: {currentQuestion.topic.code} - {currentQuestion.topic.name}
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {["option_a", "option_b", "option_c", "option_d"].map((option) => {
              const optionLetter = option.split("_")[1].toUpperCase()
              const isSelected = answers[currentQuestionIndex] === optionLetter
              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(optionLetter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span className="leading-relaxed">{currentQuestion[option]}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>

        {/* Question Navigation Grid */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold mb-3 text-sm">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined
              const isFlagged = flagged.has(idx)
              const isCurrent = idx === currentQuestionIndex

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                      : isAnswered
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : isFlagged
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-100 rounded" />
              <span>Flagged</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-muted rounded" />
              <span>Unanswered</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
