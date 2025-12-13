"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateQuestionAction } from "@/features/questions/services/question.server"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  topic_id: string
  difficulty: string
  explanation?: string
}

type EditQuestionDialogProps = {
  question: Question | null
  topics: Array<{ id: string; name: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditQuestionDialog({
  question,
  topics,
  open,
  onOpenChange,
  onSuccess,
}: EditQuestionDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A" as "A" | "B" | "C" | "D",
    topic_id: "",
    difficulty: "medium",
    explanation: "",
  })

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        topic_id: question.topic_id,
        difficulty: question.difficulty,
        explanation: question.explanation || "",
      })
    }
  }, [question])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question) return

    setIsSubmitting(true)

    try {
      await updateQuestionAction(question.id, formData)

      toast({
        title: "Success",
        description: "Question updated successfully",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update question",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details, answers, topic, and difficulty level.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question_text">Question Text</Label>
            <Textarea
              id="question_text"
              placeholder="Enter your question..."
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Answer Options</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                  A
                </div>
                <Input
                  placeholder="Option A"
                  value={formData.option_a}
                  onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                  B
                </div>
                <Input
                  placeholder="Option B"
                  value={formData.option_b}
                  onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                  C
                </div>
                <Input
                  placeholder="Option C"
                  value={formData.option_c}
                  onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                  D
                </div>
                <Input
                  placeholder="Option D"
                  value={formData.option_d}
                  onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <RadioGroup
              value={formData.correct_answer}
              onValueChange={(value) => setFormData({ ...formData, correct_answer: value as "A" | "B" | "C" | "D" })}
            >
              <div className="flex gap-4">
                {["A", "B", "C", "D"].map((letter) => (
                  <div key={letter} className="flex items-center space-x-2">
                    <RadioGroupItem value={letter} id={`answer-${letter}`} />
                    <Label htmlFor={`answer-${letter}`} className="font-normal cursor-pointer">
                      {letter}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={formData.topic_id}
                onValueChange={(value) => setFormData({ ...formData, topic_id: value })}
                required
              >
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                required
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (Optional)</Label>
            <Textarea
              id="explanation"
              placeholder="Add explanation for the correct answer..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Question"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
