"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { getAllTopicsClient } from "@/features/topics/services/topic.api"
import { getQuestionsByCategory } from "@/features/questions/services/question.actions"

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation?: string
  topic: {
    name: string
    code: string
  }
}

export default function StudyCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categoryInfo, setCategoryInfo] = useState<{ label: string; prefix: string } | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [category])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      // Parse category (e.g., "M-SPM" -> rating: M, categoryId: SPM)
      const [rating, categoryId] = category.split("-")
      
      // Get all topics to find category info
      const topics = await getAllTopicsClient()
      
      // Filter topics by prefix
      const prefix = `${rating}-${categoryId}`
      const categoryTopics = topics.filter(t => t.code.startsWith(prefix))
      
      if (categoryTopics.length === 0) {
        setIsLoading(false)
        return
      }

      // Get questions for all topics in this category
      const allQuestions = await getQuestionsByCategory(prefix)
      
      setQuestions(allQuestions as Question[])
      setCategoryInfo({ label: categoryTopics[0]?.name.split("-")[0] || "Category", prefix })
    } catch (error) {
      console.error("Failed to load questions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setShowAnswer(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Loading..." showBack />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Study Mode" showBack />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
          <p className="text-muted-foreground text-center mb-4">No questions available for this category.</p>
          <PrimaryButton onClick={() => router.back()}>Go Back</PrimaryButton>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title={`Study: ${categoryInfo?.label || "Category"}`} showBack />

      <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <MobileCard className="p-6 sm:p-8 space-y-6 min-h-[400px] flex flex-col">
          {/* Topic Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {currentQuestion.topic.code}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.topic.name}
            </Badge>
          </div>

          {/* Question */}
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Question</p>
              <p className="text-base sm:text-lg font-medium leading-relaxed">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {["A", "B", "C", "D"].map((letter) => {
                const optionKey = `option_${letter.toLowerCase()}` as keyof Question
                const isCorrect = currentQuestion.correct_answer === letter
                const showHighlight = showAnswer && isCorrect

                return (
                  <div
                    key={letter}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      showHighlight
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-muted"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className={`font-bold flex-shrink-0 ${showHighlight ? "text-green-600" : ""}`}>
                        {letter}.
                      </span>
                      <span className={showHighlight ? "text-green-600 font-medium" : ""}>
                        {currentQuestion[optionKey] as string}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Explanation */}
            {showAnswer && currentQuestion.explanation && (
              <div className="p-4 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm font-semibold mb-2 text-primary">Explanation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Show Answer Button */}
          {!showAnswer && (
            <PrimaryButton
              onClick={() => setShowAnswer(true)}
              className="w-full"
            >
              Show Answer
            </PrimaryButton>
          )}
        </MobileCard>

        {/* Navigation */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-muted hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Previous</span>
          </button>

          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-muted hover:border-primary transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Restart</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-muted hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline text-sm font-medium">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Completion Message */}
        {currentIndex === questions.length - 1 && showAnswer && (
          <MobileCard className="p-6 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-center font-semibold text-primary mb-2">
              🎉 You've reached the last question!
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Click "Restart" to review all questions again
            </p>
          </MobileCard>
        )}
      </div>
    </div>
  )
}
