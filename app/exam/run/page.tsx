import { useState, useEffect } from "react"
import { AnswerButton } from "@/components/answer-button"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { Clock, Flag, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function ExamRunPage({
  searchParams,
}: {
  searchParams: { topics?: string; count?: string; timer?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const topicIds = searchParams.topics?.split(",") || []
  const questionCount = Number.parseInt(searchParams.count || "20")
  const timerEnabled = searchParams.timer === "true"

  if (topicIds.length === 0) {
    redirect("/exam/setup")
  }

  // Fetch approved questions from selected topics
  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, topic_id")
    .in("topic_id", topicIds)
    .eq("status", "approved")
    .limit(questionCount)
    .order("created_at", { ascending: false })

  if (!questions || questions.length === 0) {
    redirect("/exam/setup")
  }

  const ExamRunClient = ({
    questions,
    timerEnabled,
    questionCount,
  }: {
    questions: any[]
    timerEnabled: boolean
    questionCount: number
  }) => {
    const router = useRouter()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({})
    const [flagged, setFlagged] = useState<Set<number>>(new Set())
    const [timeRemaining, setTimeRemaining] = useState(timerEnabled ? questionCount * 60 : 0) // Timer based on question count

    useEffect(() => {
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

    const handleAnswer = (answer: "A" | "B" | "C" | "D") => {
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
              <div className="flex items-center gap-2">
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
            </div>
            <Progress value={progress} className="h-1.5 bg-primary-foreground/20 [&>div]:bg-accent" />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full pb-32">
          {/* Question Text */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-lg font-semibold text-foreground">Question {currentQuestion + 1}</h2>
              {flagged.has(currentQuestion) && <Flag className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />}
            </div>
            <p className="text-base leading-relaxed text-foreground">{question.question_text}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {Object.entries(question).map(([letter, text]) => {
              if (letter.startsWith("option")) {
                return (
                  <AnswerButton
                    key={letter}
                    letter={letter.charAt(6)}
                    text={text}
                    selected={answers[currentQuestion] === letter.charAt(6)}
                    onClick={() => handleAnswer(letter.charAt(6) as "A" | "B" | "C" | "D")}
                  />
                )
              }
              return null
            })}
          </div>

          {/* Progress Info */}
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

  return <ExamRunClient questions={questions} timerEnabled={timerEnabled} questionCount={questionCount} />
}
