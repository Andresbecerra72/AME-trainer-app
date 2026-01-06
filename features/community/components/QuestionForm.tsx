"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createCommunityQuestion, updateCommunityQuestion } from "@/features/community/community.api"
import { questionFormSchema, type QuestionFormValues } from "@/features/community/community.validation"
import { checkQuestionDuplicates } from "@/features/questions/services/duplicates"
import Link from "next/link"

interface Topic {
  id: string
  name: string
  code?: string
}

interface QuestionFormProps {
  topics: Topic[]
  initialData?: Partial<QuestionFormValues> & { id?: string }
  mode?: "create" | "edit"
}

export function QuestionForm({ topics, initialData, mode = "create" }: QuestionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [duplicateChecked, setDuplicateChecked] = useState(false)
  
  const [formData, setFormData] = useState<Partial<QuestionFormValues>>({
    question_text: initialData?.question_text || "",
    option_a: initialData?.option_a || "",
    option_b: initialData?.option_b || "",
    option_c: initialData?.option_c || "",
    option_d: initialData?.option_d || "",
    correct_answer: initialData?.correct_answer || undefined,
    explanation: initialData?.explanation || "",
    topic_id: initialData?.topic_id || "",
    difficulty: initialData?.difficulty || undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Group topics by rating and category
  const groupedTopics = useMemo(() => {
    const groups: Record<string, Record<string, Topic[]>> = {}

    topics.forEach((topic) => {
      if (!topic.code) return

      // Parse code: M-SPM-01 -> Rating: M, Category: SPM
      const parts = topic.code.split("-")
      if (parts.length < 2) return

      const rating = parts[0] // M, T, E
      const category = parts[1] // SPM, AF, PP, TG, EG, etc.

      if (!groups[rating]) groups[rating] = {}
      if (!groups[rating][category]) groups[rating][category] = []
      groups[rating][category].push(topic)
    })

    return groups
  }, [topics])

  const ratingNames: Record<string, string> = {
    M: "M Rating",
    T: "T Rating",
    E: "E Rating",
  }

  const categoryNames: Record<string, string> = {
    SPM: "Standard Practices",
    AF: "Airframe",
    PP: "Powerplant",
    TG: "Turbine Gas",
    EG: "Electrical General",
    EAV: "Avionics",
  }

  const handleChange = (field: keyof QuestionFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Reset duplicate check when question text changes
    if (field === "question_text") {
      setDuplicateChecked(false)
      setDuplicates([])
    }
  }

  const checkForDuplicates = async () => {
    if (!formData.question_text || formData.question_text.trim().length < 10) {
      toast.error("Question text too short to check for duplicates (minimum 10 characters)")
      return
    }

    setCheckingDuplicates(true)
    try {
      const results = await checkQuestionDuplicates(formData.question_text)
      setDuplicates(results)
      setDuplicateChecked(true)
      
      if (results.length > 0) {
        toast.warning(`Found ${results.length} similar question(s)`)
      } else {
        toast.success("No duplicates found!")
      }
    } catch (error) {
      toast.error("Failed to check for duplicates")
    } finally {
      setCheckingDuplicates(false)
    }
  }

  const validateForm = (): boolean => {
    try {
      questionFormSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        const field = err.path[0]
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    // Auto-check for duplicates if not already checked (create mode only)
    if (mode === "create" && !duplicateChecked && formData.question_text && formData.question_text.trim().length >= 10) {
      setLoading(true)
      try {
        const results = await checkQuestionDuplicates(formData.question_text)
        setDuplicates(results)
        setDuplicateChecked(true)
        
        if (results.length > 0) {
          toast.warning(`Found ${results.length} similar question(s). Please review them before continuing.`, {
            duration: 5000,
          })
          setLoading(false)
          
          // Scroll to duplicate check section
          setTimeout(() => {
            const duplicateSection = document.getElementById("duplicate-check-section")
            if (duplicateSection) {
              duplicateSection.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }, 100)
          
          return
        } else {
          toast.success("No duplicates found. Submitting question...", {
            duration: 2000,
          })
        }
      } catch (error) {
        toast.error("Failed to check for duplicates")
        setLoading(false)
        return
      }
    }

    setLoading(true)
    try {
      if (mode === "edit" && initialData?.id) {
        await updateCommunityQuestion(initialData.id, formData as QuestionFormValues)
        toast.success("Question updated successfully!")
        router.push(`/protected/community/questions/${initialData.id}`)
      } else {
        try {
          const question = await createCommunityQuestion(formData as QuestionFormValues)
          toast.success("Question submitted for review!")
          router.push("/protected/community")
        } catch (createError: any) {
          console.error("Create error caught:", createError)
          // Check if it's a duplicate error
          if (createError.message && createError.message.includes("similar")) {
            toast.error(createError.message, { duration: 7000 })
            // Force re-check to show duplicates
            setDuplicateChecked(false)
            const results = await checkQuestionDuplicates(formData.question_text!)
            setDuplicates(results)
            setDuplicateChecked(true)
            
            setTimeout(() => {
              const duplicateSection = document.getElementById("duplicate-check-section")
              if (duplicateSection) {
                duplicateSection.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            }, 200)
          } else {
            toast.error(createError.message || "Failed to submit question")
          }
          throw createError
        }
      }
    } catch (error: any) {
      // Don't show duplicate toast here, already shown above
      if (!error.message?.includes("similar")) {
        toast.error(error.message || "Failed to submit question")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question_text">Question *</Label>
        <Textarea
          id="question_text"
          value={formData.question_text}
          onChange={(e) => handleChange("question_text", e.target.value)}
          placeholder="Enter your question... (minimum 10 characters)"
          rows={4}
          className={`resize-none ${errors.question_text ? "border-destructive" : ""}`}
        />
        {errors.question_text && (
          <p className="text-sm text-destructive">{errors.question_text}</p>
        )}
      </div>

      {/* Duplicate Check */}
      {formData.question_text && formData.question_text.trim().length >= 10 && mode === "create" && (
        <Card 
          id="duplicate-check-section"
          className="p-4 space-y-3 border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm font-medium">Duplicate Detection</p>
          </div>

          {!duplicateChecked ? (
            <>
              <p className="text-xs text-muted-foreground">
                We'll automatically check for duplicates when you submit, or you can check now.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={checkForDuplicates}
                disabled={checkingDuplicates}
                className="w-full sm:w-auto"
              >
                {checkingDuplicates ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Now for Duplicates"
                )}
              </Button>
            </>
          ) : duplicates.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-semibold">No similar questions found. You're good to go!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-3 border border-yellow-300 dark:border-yellow-700">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  ⚠️ Similar questions detected
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Found {duplicates.length} similar question(s). Please review them to avoid duplicates.
                </p>
              </div>
              {duplicates.map((dup) => (
                <Card key={dup.id} className="p-3 bg-background border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {dup.similarity}%
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm mb-2 line-clamp-3">{dup.question_text}</p>
                      <Link href={`/protected/community/questions/${dup.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          View Full Question →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDuplicateChecked(false)
                    setDuplicates([])
                  }}
                  className="text-xs"
                >
                  Check Again
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setDuplicateChecked(false)
                    setDuplicates([])
                    handleSubmit(new Event("submit") as any)
                  }}
                  className="text-xs bg-yellow-600 hover:bg-yellow-700"
                >
                  Submit Anyway
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Answer Options */}
      <div className="space-y-3">
        <Label>Answer Options *</Label>
        {(["A", "B", "C", "D"] as const).map((option) => (
          <div key={option} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold w-6 text-sm sm:text-base flex-shrink-0">
                {option}.
              </span>
              <Input
                value={formData[`option_${option.toLowerCase()}` as keyof QuestionFormValues] as string}
                onChange={(e) =>
                  handleChange(`option_${option.toLowerCase()}` as keyof QuestionFormValues, e.target.value)
                }
                placeholder={`Option ${option}`}
                className={errors[`option_${option.toLowerCase()}`] ? "border-destructive" : ""}
              />
            </div>
            {errors[`option_${option.toLowerCase()}`] && (
              <p className="text-xs text-destructive ml-8">
                {errors[`option_${option.toLowerCase()}`]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      <div className="space-y-2">
        <Label htmlFor="correct_answer">Correct Answer *</Label>
        <Select
          value={formData.correct_answer}
          onValueChange={(value) => handleChange("correct_answer", value)}
        >
          <SelectTrigger className={errors.correct_answer ? "border-destructive" : ""}>
            <SelectValue placeholder="Select correct answer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Option A</SelectItem>
            <SelectItem value="B">Option B</SelectItem>
            <SelectItem value="C">Option C</SelectItem>
            <SelectItem value="D">Option D</SelectItem>
          </SelectContent>
        </Select>
        {errors.correct_answer && (
          <p className="text-sm text-destructive">{errors.correct_answer}</p>
        )}
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation *</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => handleChange("explanation", e.target.value)}
          placeholder="Explain why this is the correct answer... (minimum 10 characters)"
          rows={3}
          className={`resize-none ${errors.explanation ? "border-destructive" : ""}`}
        />
        {errors.explanation && (
          <p className="text-sm text-destructive">{errors.explanation}</p>
        )}
      </div>

      {/* Topic and Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic_id">Topic *</Label>
          <Select value={formData.topic_id} onValueChange={(value) => handleChange("topic_id", value)}>
            <SelectTrigger className={errors.topic_id ? "border-destructive" : ""}>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {Object.entries(groupedTopics).map(([rating, categories]) => (
                <SelectGroup key={rating}>
                  <SelectLabel className="text-base font-bold text-primary">
                    {ratingNames[rating] || rating}
                  </SelectLabel>
                  {Object.entries(categories).map(([category, categoryTopics]) => (
                    <div key={category}>
                      <SelectLabel className="pl-4 text-sm font-semibold text-muted-foreground">
                        {categoryNames[category] || category}
                      </SelectLabel>
                      {categoryTopics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id} className="pl-8">
                          {topic.code} - {topic.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {errors.topic_id && <p className="text-sm text-destructive">{errors.topic_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => handleChange("difficulty", value)}
          >
            <SelectTrigger className={errors.difficulty ? "border-destructive" : ""}>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          {errors.difficulty && <p className="text-sm text-destructive">{errors.difficulty}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:flex-1 order-1 sm:order-2">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "edit" ? "Updating..." : "Submitting..."}
            </>
          ) : mode === "edit" ? (
            "Update Question"
          ) : (
            "Submit Question"
          )}
        </Button>
      </div>
    </form>
  )
}
