"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight, ChevronDown, Award, Layers, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { createCommunityExam } from "@/lib/db-actions"
import {
  type TopicWithQuestions,
  type CommunityExamFormData,
  groupTopicsByRating,
  groupTopicsByCategory,
  calculateTotalQuestions,
  validateExamForm,
  calculateRecommendedTime,
  formatTopicQuestionsForDB,
  generateExamSummary,
  MAX_TOTAL_QUESTIONS,
  extractRating,
  extractCategory,
} from "@/features/exams/community-exams.logic"
import { MobileCard } from "@/components/mobile-card"

type Step = "rating" | "category" | "topics" | "details"

interface CommunityExamCreateFormProps {
  topics: Array<{
    id: string
    name: string
    code: string
    question_count: number
  }>
}

export function CommunityExamCreateForm({ topics }: CommunityExamCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>("rating")
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [topicQuestions, setTopicQuestions] = useState<Map<string, number>>(new Map())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  
  const [formData, setFormData] = useState<CommunityExamFormData>({
    title: "",
    description: "",
    timeLimit: 70, // Default to 70 minutes (1 per question)
    difficulty: "mixed",
    isPublic: true,
  })

  // Convert topics to TopicWithQuestions format
  const topicsWithCount: TopicWithQuestions[] = useMemo(
    () =>
      topics.map((t) => ({
        ...t,
        selected_count: topicQuestions.get(t.id) || 0,
      })),
    [topics, topicQuestions]
  )

  // Group topics by rating and category
  const topicsByRating = useMemo(() => groupTopicsByRating(topicsWithCount), [topicsWithCount])
  const availableRatings = Object.keys(topicsByRating).sort()

  const topicsForCategory = useMemo(() => {
    if (!selectedRating) return []
    return topicsByRating[selectedRating]?.filter((t) => extractCategory(t.code) === selectedCategory) || []
  }, [topicsByRating, selectedRating, selectedCategory])

  const categoriesForRating = useMemo(() => {
    if (!selectedRating) return []
    const topics = topicsByRating[selectedRating] || []
    const grouped = groupTopicsByCategory(topics)
    return Object.keys(grouped).sort()
  }, [topicsByRating, selectedRating])

  const totalQuestions = calculateTotalQuestions(topicQuestions)

  const handleSelectRating = (rating: string) => {
    setSelectedRating(rating)
    setSelectedCategory(null)
    setTopicQuestions(new Map())
    setStep("category")
  }

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category)
    setStep("topics")
  }

  const handleTopicQuestionChange = (topicId: string, count: string) => {
    const num = Math.max(0, Math.min(100, Number.parseInt(count) || 0))
    const newMap = new Map(topicQuestions)
    
    if (num === 0) {
      newMap.delete(topicId)
    } else {
      newMap.set(topicId, num)
    }
    
    setTopicQuestions(newMap)
  }

  const toggleExpandTopic = (topicId: string) => {
    const newSet = new Set(expandedTopics)
    if (newSet.has(topicId)) {
      newSet.delete(topicId)
    } else {
      newSet.add(topicId)
    }
    setExpandedTopics(newSet)
  }

  const handleSubmit = async () => {
    const validation = validateExamForm(formData, topicQuestions)
    
    if (!validation.isValid) {
      toast.error(validation.error)
      return
    }

    if (!selectedRating || !selectedCategory) {
      toast.error("Please select rating and category")
      return
    }

    setLoading(true)
    try {
      const { topic_ids, question_count } = formatTopicQuestionsForDB(topicQuestions)
      
      const exam = await createCommunityExam({
        title: formData.title,
        description: formData.description || undefined,
        topic_ids,
        question_count,
        time_limit: formData.timeLimit || undefined,
        difficulty: formData.difficulty,
        is_public: formData.isPublic,
      })

      toast.success("Community exam created successfully!")
      router.push(`/protected/exams/${exam.id}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create exam")
    } finally {
      setLoading(false)
    }
  }

  const canProceedToDetails = topicQuestions.size > 0 && totalQuestions <= MAX_TOTAL_QUESTIONS

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
        <span className={step === "rating" ? "font-semibold text-primary" : ""}>1. Rating</span>
        <ChevronRight className="w-4 h-4" />
        <span className={step === "category" ? "font-semibold text-primary" : ""}>2. Category</span>
        <ChevronRight className="w-4 h-4" />
        <span className={step === "topics" ? "font-semibold text-primary" : ""}>3. Topics</span>
        <ChevronRight className="w-4 h-4" />
        <span className={step === "details" ? "font-semibold text-primary" : ""}>4. Details</span>
      </div>

      {/* Step 1: Select Rating */}
      {step === "rating" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select Rating</h2>
          {availableRatings.map((rating) => {
            const ratingTopics = topicsByRating[rating]
            const totalQs = ratingTopics.reduce((sum, t) => sum + t.question_count, 0)

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
                    <div>
                      <h3 className="font-semibold">{rating} Rating</h3>
                      <p className="text-sm text-muted-foreground">{totalQs} questions available</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </MobileCard>
            )
          })}
        </div>
      )}

      {/* Step 2: Select Category */}
      {step === "category" && selectedRating && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{selectedRating} Rating - Select Category</h2>
            <Button variant="ghost" size="sm" onClick={() => setStep("rating")}>
              Change Rating
            </Button>
          </div>
          {categoriesForRating.map((category) => {
            const catTopics = topicsByRating[selectedRating].filter((t) => extractCategory(t.code) === category)
            const totalQs = catTopics.reduce((sum, t) => sum + t.question_count, 0)

            return (
              <MobileCard
                key={category}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleSelectCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{category}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {catTopics.length} topics • {totalQs} questions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </MobileCard>
            )
          })}
        </div>
      )}

      {/* Step 3: Select Questions per Topic */}
      {step === "topics" && selectedRating && selectedCategory && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select Questions per Topic</h2>
            <Button variant="ghost" size="sm" onClick={() => setStep("category")}>
              Change Category
            </Button>
          </div>

          <MobileCard className={totalQuestions > MAX_TOTAL_QUESTIONS ? "border-destructive" : "border-primary/20"}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Questions</span>
                <span className={`text-lg font-bold ${
                  totalQuestions > MAX_TOTAL_QUESTIONS ? "text-destructive" : "text-primary"
                }`}>
                  {totalQuestions} / {MAX_TOTAL_QUESTIONS}
                </span>
              </div>
              {totalQuestions > MAX_TOTAL_QUESTIONS && (
                <div className="flex items-start gap-2 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Please reduce the total to {MAX_TOTAL_QUESTIONS} or less</span>
                </div>
              )}
            </div>
          </MobileCard>

          <div className="space-y-2">
            {topicsForCategory.map((topic) => (
              <MobileCard key={topic.id}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{topic.name}</h4>
                      <p className="text-xs text-muted-foreground">{topic.question_count} available</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={topic.question_count}
                        value={topicQuestions.get(topic.id) || ""}
                        onChange={(e) => handleTopicQuestionChange(topic.id, e.target.value)}
                        className="w-20 h-9 text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>

          <Button onClick={() => setStep("details")} className="w-full" disabled={!canProceedToDetails}>
            Continue to Details
          </Button>
        </div>
      )}

      {/* Step 4: Exam Details */}
      {step === "details" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Exam Details</h2>
            <Button variant="ghost" size="sm" onClick={() => setStep("topics")}>
              Change Topics
            </Button>
          </div>

          <Card className="p-4 sm:p-6 space-y-4">
            <div>
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., M Rating Airframe Practice Exam"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this exam covers..."
                rows={3}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="0"
                  max="180"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) || 0 })}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: {calculateRecommendedTime(totalQuestions)} min
                </p>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1.5 h-10"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked as boolean })}
              />
              <label htmlFor="isPublic" className="cursor-pointer">
                <div className="font-medium text-sm">Make this exam public</div>
                <div className="text-xs text-muted-foreground">
                  Public exams can be taken by anyone in the community
                </div>
              </label>
            </div>
          </Card>

          {/* Summary */}
          <MobileCard className="bg-primary/5 border-primary/20">
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">Exam Summary</h3>
              <ul className="space-y-1 text-muted-foreground">
                {generateExamSummary(formData, topicQuestions, selectedRating!, selectedCategory!).map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </MobileCard>

          <Button onClick={handleSubmit} size="lg" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Community Exam"}
          </Button>
        </div>
      )}
    </div>
  )
}
