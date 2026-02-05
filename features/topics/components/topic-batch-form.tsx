"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { RatingSelector } from "./rating-selector"
import { CategorySelector } from "./category-selector"
import { IconPicker } from "@/components/shared/icon-picker"
import { createTopicBatchAction } from "../services/topic.server"
import {
  RATINGS,
  getRatingById,
  getCategoryById,
  generateTopicCode,
  type Rating,
  type TopicFormData,
} from "../types/topic.types"
import { cn } from "@/lib/utils"

type Step = "rating" | "category" | "topics" | "review"

interface TopicInput {
  id: string
  name: string
  description: string
  icon: string
  sequence: number
}

export function TopicBatchForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("rating")
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [topics, setTopics] = useState<TopicInput[]>([
    { id: "1", name: "", description: "", icon: "book", sequence: 1 },
  ])
  const [loading, setLoading] = useState(false)

  // Get current rating and category info
  const currentRating = selectedRating ? getRatingById(selectedRating) : null
  const currentCategory =
    selectedRating && selectedCategory
      ? getCategoryById(selectedRating, selectedCategory)
      : null

  // Navigation handlers
  const goToNextStep = () => {
    if (step === "rating" && !selectedRating) {
      toast.error("Please select a rating")
      return
    }
    if (step === "category" && !selectedCategory) {
      toast.error("Please select a category")
      return
    }
    if (step === "topics") {
      const hasEmptyFields = topics.some(
        (t) => !t.name.trim() || !t.description.trim()
      )
      if (hasEmptyFields) {
        toast.error("Please fill in all topic fields")
        return
      }
    }

    const steps: Step[] = ["rating", "category", "topics", "review"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const goToPreviousStep = () => {
    const steps: Step[] = ["rating", "category", "topics", "review"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  // Topic management
  const addTopic = () => {
    const newId = String(topics.length + 1)
    const newSequence = Math.max(...topics.map((t) => t.sequence), 0) + 1
    setTopics([
      ...topics,
      {
        id: newId,
        name: "",
        description: "",
        icon: "book",
        sequence: newSequence,
      },
    ])
  }

  const removeTopic = (id: string) => {
    if (topics.length === 1) {
      toast.error("You must have at least one topic")
      return
    }
    setTopics(topics.filter((t) => t.id !== id))
  }

  const updateTopic = (id: string, field: keyof TopicInput, value: string | number) => {
    setTopics(
      topics.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!selectedRating || !selectedCategory) {
      toast.error("Missing rating or category")
      return
    }

    setLoading(true)
    try {
      const topicsData: TopicFormData[] = topics.map((topic) => ({
        name: topic.name,
        description: topic.description,
        code: generateTopicCode(selectedRating, selectedCategory, topic.sequence),
        icon: topic.icon,
        ratingId: selectedRating,
        categoryId: selectedCategory,
      }))

      await createTopicBatchAction({ topics: topicsData })

      toast.success(`Successfully created ${topics.length} topic(s)!`)
      router.push("/admin/topics")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to create topics")
    } finally {
      setLoading(false)
    }
  }

  // Progress indicator
  const steps: Step[] = ["rating", "category", "topics", "review"]
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step indicators */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { key: "rating", label: "Rating" },
                { key: "category", label: "Category" },
                { key: "topics", label: "Topics" },
                { key: "review", label: "Review" },
              ].map((s, idx) => (
                <div
                  key={s.key}
                  className={cn(
                    "text-center font-medium transition-colors",
                    idx <= currentStepIndex
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* STEP 1: Rating Selection */}
          {step === "rating" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Rating</h2>
                <p className="text-muted-foreground">
                  Choose the AME rating for these topics
                </p>
              </div>
              <RatingSelector
                ratings={RATINGS}
                selectedRating={selectedRating}
                onSelect={setSelectedRating}
              />
            </div>
          )}

          {/* STEP 2: Category Selection */}
          {step === "category" && currentRating && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Category</h2>
                <p className="text-muted-foreground">
                  Choose a category within <strong>{currentRating.name}</strong>
                </p>
              </div>
              <CategorySelector
                categories={currentRating.categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          )}

          {/* STEP 3: Topics Input */}
          {step === "topics" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Add Topics</h2>
                  <p className="text-muted-foreground">
                    Create topics for{" "}
                    <strong>
                      {currentRating?.name} → {currentCategory?.name}
                    </strong>
                  </p>
                </div>
                <Button onClick={addTopic} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </div>

              <div className="space-y-4">
                {topics.map((topic, index) => (
                  <Card key={topic.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {index + 1}
                            </div>
                            <h4 className="font-semibold">Topic {index + 1}</h4>
                          </div>
                          {topics.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTopic(topic.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label>Topic Name *</Label>
                            <Input
                              value={topic.name}
                              onChange={(e) =>
                                updateTopic(topic.id, "name", e.target.value)
                              }
                              placeholder="e.g., Aircraft Structures"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Description *</Label>
                            <Textarea
                              value={topic.description}
                              onChange={(e) =>
                                updateTopic(topic.id, "description", e.target.value)
                              }
                              placeholder="Brief description of the topic..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label>Icon</Label>
                            <IconPicker
                              value={topic.icon}
                              onChange={(icon) => updateTopic(topic.id, "icon", icon)}
                            />
                          </div>

                          <div>
                            <Label>Sequence Number</Label>
                            <Input
                              type="number"
                              value={topic.sequence}
                              onChange={(e) =>
                                updateTopic(
                                  topic.id,
                                  "sequence",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              min={1}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Code:{" "}
                              {selectedRating &&
                                selectedCategory &&
                                generateTopicCode(
                                  selectedRating,
                                  selectedCategory,
                                  topic.sequence
                                )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === "review" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
                <p className="text-muted-foreground">
                  Review your topics before creating them
                </p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Rating</p>
                      <p className="font-semibold">{currentRating?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Category</p>
                      <p className="font-semibold">{currentCategory?.name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-1">Topics to create</p>
                      <p className="font-semibold">{topics.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {topics.map((topic, index) => (
                  <Card key={topic.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1">{topic.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {topic.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Code:{" "}
                            {selectedRating &&
                              selectedCategory &&
                              generateTopicCode(
                                selectedRating,
                                selectedCategory,
                                topic.sequence
                              )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={step === "rating" || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step === "review" ? (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create {topics.length} Topic{topics.length > 1 ? "s" : ""}
              </Button>
            ) : (
              <Button onClick={goToNextStep} disabled={loading}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
