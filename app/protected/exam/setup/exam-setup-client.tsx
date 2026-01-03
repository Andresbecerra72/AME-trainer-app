"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronRight, Award, Layers } from "lucide-react"
import {
  type TopicWithCount,
  type Category,
  DEFAULT_QUESTION_COUNT,
  groupTopicsByRating,
  groupTopicsByCategory,
  getRatingName,
  getRatingDescription,
  validateExamConfig,
  buildExamParams,
} from "@/features/exams/exam-setup.logic"

interface ExamSetupClientProps {
  topics: TopicWithCount[]
}

type Step = "rating" | "category"

export function ExamSetupClient({ topics }: ExamSetupClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("rating")
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT.toString())
  const [timerEnabled, setTimerEnabled] = useState(true)

  // Agrupar topics por rating
  const topicsByRating = groupTopicsByRating(topics)
  const availableRatings = Object.keys(topicsByRating).sort()

  // Obtener categorías del rating seleccionado
  const categoriesForRating: Category[] =
    selectedRating ? groupTopicsByCategory(topicsByRating[selectedRating]) : []

  const handleSelectRating = (rating: string) => {
    setSelectedRating(rating)
    setSelectedCategory(null)
    setStep("category")
  }

  const handleSelectCategory = (categoryCode: string) => {
    setSelectedCategory(categoryCode)
  }

  const handleBack = () => {
    if (step === "category") {
      setStep("rating")
      setSelectedRating(null)
      setSelectedCategory(null)
    } else {
      router.back()
    }
  }

  const handleStartExam = () => {
    const validation = validateExamConfig(selectedCategory, Number(questionCount))

    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    // Obtener todos los topic IDs de la categoría seleccionada
    const selectedCategoryData = categoriesForRating.find((cat) => cat.code === selectedCategory)
    if (!selectedCategoryData) return

    const topicIds = selectedCategoryData.topics.map((t) => t.id)
    const params = buildExamParams(selectedCategory!, topicIds, Number(questionCount), timerEnabled)

    router.push(`/protected/exam/run?${params.toString()}`)
  }

  const selectedCategoryData = categoriesForRating.find((cat) => cat.code === selectedCategory)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader
        title={step === "rating" ? "Select Rating" : `${getRatingName(selectedRating!)} - Category`}
        showBack
        onBack={handleBack}
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* STEP 1: Seleccionar Rating */}
        {step === "rating" && (
          <div className="space-y-3">
            {availableRatings.map((rating) => {
              const ratingTopics = topicsByRating[rating]
              const totalQuestions = ratingTopics.reduce((sum, t) => sum + t.question_count, 0)

              return (
                <MobileCard
                  key={rating}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectRating(rating)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{getRatingName(rating)}</h3>
                        <p className="text-sm text-muted-foreground">{getRatingDescription(rating)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="text-sm font-medium">{totalQuestions} questions</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </MobileCard>
              )
            })}
          </div>
        )}

        {/* STEP 2: Seleccionar Categoría y Configuración */}
        {step === "category" && (
          <>
            {/* Categorías */}
            <div className="space-y-3">
              <Label className="text-base">Select a Category</Label>
              {categoriesForRating.map((category) => (
                <MobileCard
                  key={category.code}
                  className={`cursor-pointer transition-all ${
                    selectedCategory === category.code
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => handleSelectCategory(category.code)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selectedCategory === category.code ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {category.topics.length} topic{category.topics.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-sm font-medium">{category.totalQuestions} Q's</div>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>

            {/* Configuración del Examen */}
            {selectedCategory && (
              <>
                {/* Number of Questions */}
                <div className="space-y-2">
                  <Label htmlFor="question-count">Number of Questions</Label>
                  <Input
                    id="question-count"
                    type="number"
                    min="5"
                    max="100"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground px-1">
                    Default: {DEFAULT_QUESTION_COUNT} questions (between 5 and 100)
                  </p>
                </div>

                {/* Timer Toggle */}
                <MobileCard>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="timer" className="text-base cursor-pointer">
                        Enable Timer
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {timerEnabled ? "1 minute per question" : "No time limit"}
                      </p>
                    </div>
                    <Switch id="timer" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
                  </div>
                </MobileCard>

                {/* Exam Summary */}
                <MobileCard className="bg-primary/5 border-primary/20">
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-foreground">Exam Summary</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p>• {questionCount} questions</p>
                      <p>• {timerEnabled ? `${questionCount} minutes` : "No time limit"}</p>
                      <p>• {selectedCategoryData?.name}</p>
                      <p>
                        • {selectedCategoryData?.topics.length} topic
                        {selectedCategoryData?.topics.length !== 1 ? "s" : ""} covered
                      </p>
                    </div>
                  </div>
                </MobileCard>
              </>
            )}
          </>
        )}

        {/* Start Button - Fixed at bottom */}
        {step === "category" && selectedCategory && (
          <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-background border-t border-border">
            <div className="max-w-2xl mx-auto">
              <PrimaryButton onClick={handleStartExam} fullWidth>
                Start Exam
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
