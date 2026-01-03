"use client"

import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { AnswerButton } from "@/components/answer-button"
import { CheckCircle2, XCircle, Flag } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ReviewQuestion {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string | null
  userAnswer?: string | null
  flagged?: boolean
}

export default function ReviewAnswersPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<ReviewQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReviewData = () => {
      const stored = sessionStorage.getItem("examReview")
      
      if (!stored) {
        console.log("[ExamReview] No review data found, redirecting")
        router.push("/protected/exam/setup")
        return
      }

      try {
        const reviewData = JSON.parse(stored)
        console.log("[ExamReview] Loaded review data:", reviewData)

        const { userAnswers, questions: examQuestions, flaggedQuestions } = reviewData

        // Mapear preguntas con respuestas del usuario
        const questionsWithAnswers = examQuestions.map((q: any, idx: number) => {
          const userAnswerData = userAnswers.find((ua: any) => ua.questionId === q.id)
          const isFlagged = flaggedQuestions.includes(idx)

          return {
            id: q.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            userAnswer: userAnswerData?.userAnswer || null,
            flagged: isFlagged,
          }
        })

        console.log("[ExamReview] Processed questions:", questionsWithAnswers)
        setQuestions(questionsWithAnswers)
      } catch (error) {
        console.error("[ExamReview] Error parsing review data:", error)
        router.push("/protected/exam/setup")
        return
      }

      setLoading(false)
    }

    loadReviewData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Review Answers" showBack />
        <div className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Review Answers" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto pb-8">
        {questions.map((question, index) => {
          const isCorrect = question.userAnswer === question.correct_answer
          const wasAnswered = question.userAnswer !== undefined && question.userAnswer !== null

          return (
            <MobileCard key={question.id} className="space-y-4">
              {/* Question Header */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">Question {index + 1}</h3>
                    {question.flagged && (
                      <span className="flex items-center gap-1 text-xs text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
                        <Flag className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{question.question_text}</p>
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-2 pl-9">
                <AnswerButton
                  letter="A"
                  text={question.option_a}
                  correct={question.correct_answer === "A"}
                  wrong={question.userAnswer === "A" && !isCorrect}
                  disabled
                />
                <AnswerButton
                  letter="B"
                  text={question.option_b}
                  correct={question.correct_answer === "B"}
                  wrong={question.userAnswer === "B" && !isCorrect}
                  disabled
                />
                <AnswerButton
                  letter="C"
                  text={question.option_c}
                  correct={question.correct_answer === "C"}
                  wrong={question.userAnswer === "C" && !isCorrect}
                  disabled
                />
                <AnswerButton
                  letter="D"
                  text={question.option_d}
                  correct={question.correct_answer === "D"}
                  wrong={question.userAnswer === "D" && !isCorrect}
                  disabled
                />
              </div>

              {/* Result Summary */}
              <div className="pl-9 pt-2 border-t border-border">
                {isCorrect ? (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Correct! You selected {question.userAnswer}
                  </p>
                ) : wasAnswered ? (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Incorrect. You selected {question.userAnswer}, correct answer is {question.correct_answer}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground font-medium">
                    Not answered. Correct answer is {question.correct_answer}
                  </p>
                )}
                {question.explanation && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-foreground">
                    <span className="font-semibold">Explanation: </span>
                    {question.explanation}
                  </div>
                )}
              </div>
            </MobileCard>
          )
        })}
      </div>
    </div>
  )
}
