"use client"

import { useState, useEffect } from "react"
import { AnswerButton } from "@/components/answer-button"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { Clock, Flag, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

type Question = any

export default function ExamRunClient({
  questions,
  timerEnabled,
  questionCount,
}: {
  questions: Question[]
  timerEnabled: boolean
  questionCount: number
}) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(questionCount * 60)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!timerEnabled) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerEnabled])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }))
  }

  const toggleFlag = () => {
    setFlagged((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion)
      } else {
        newSet.add(currentQuestion)
      }
      return newSet
    })
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60)
    let correct = 0
    const results: { questionId: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[] = []

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx] || ""
      const isCorrect = userAnswer === q.correct_answer
      if (isCorrect) correct++
      results.push({
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
      })
    })

    // Store results in sessionStorage to pass to results page
    sessionStorage.setItem(
      "examResults",
      JSON.stringify({
        score: Math.round((correct / questions.length) * 100),
        totalQuestions: questions.length,
        correctAnswers: correct,
        wrongAnswers: questions.length - correct - (questions.length - Object.keys(answers).length),
        skippedAnswers: questions.length - Object.keys(answers).length,
        timeSpent,
        results,
        questions,
      }),
    )

    router.push("/exam/results")
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            {timerEnabled && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <div className="text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          <Progress value={progress} className="h-1.5 bg-primary-foreground/20 [&>div]:bg-accent" />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full pb-32">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="text-lg font-semibold text-foreground">Question {currentQuestion + 1}</h2>
            {flagged.has(currentQuestion) && <Flag className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />}
          </div>
          <p className="text-base leading-relaxed text-foreground">{question.question_text}</p>
        </div>

        <div className="space-y-3">
          {[
            { letter: "A", text: question.option_a },
            { letter: "B", text: question.option_b },
            { letter: "C", text: question.option_c },
            { letter: "D", text: question.option_d },
          ].map(({ letter, text }) => (
            <AnswerButton
              key={letter}
              letter={letter}
              text={text}
              selected={answers[currentQuestion] === letter}
              onClick={() => handleAnswer(letter)}
            />
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {answeredCount} of {questions.length} questions answered
          {flagged.size > 0 && ` • ${flagged.size} flagged`}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex gap-3">
            <SecondaryButton
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </SecondaryButton>

            <SecondaryButton
              onClick={toggleFlag}
              className={flagged.has(currentQuestion) ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500" : ""}
            >
              <Flag className={`w-4 h-4 ${flagged.has(currentQuestion) ? "fill-amber-500 text-amber-500" : ""}`} />
            </SecondaryButton>

            {currentQuestion === questions.length - 1 ? (
              <PrimaryButton onClick={handleSubmit} className="flex-1">
                Submit Exam
              </PrimaryButton>
            ) : (
              <SecondaryButton
                onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex-1"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </SecondaryButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
