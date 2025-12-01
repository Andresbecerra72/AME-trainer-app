"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCommunityExam } from "@/lib/db-actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { DbTopic } from "@/lib/types"

export function ExamCreateForm({ topics }: { topics: DbTopic[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questionCount: 20,
    timeLimit: 60,
    difficulty: "mixed",
    isPublic: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic")
      return
    }

    setLoading(true)
    try {
      const exam = await createCommunityExam({
        title: formData.title,
        description: formData.description,
        topic_ids: selectedTopics,
        question_count: formData.questionCount,
        time_limit: formData.timeLimit,
        difficulty: formData.difficulty,
        is_public: formData.isPublic,
      })

      toast.success("Community exam created successfully!")
      router.push(`/exams/${exam.id}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create exam")
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => (prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Exam Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., AME License Practice Test"
              required
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionCount">Number of Questions *</Label>
              <Input
                id="questionCount"
                type="number"
                min="5"
                max="100"
                value={formData.questionCount}
                onChange={(e) => setFormData({ ...formData, questionCount: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="0"
                max="180"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <select
              id="difficulty"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
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
      </Card>

      <Card className="p-6">
        <Label className="mb-4 block">Select Topics *</Label>
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic.id} className="flex items-start gap-3">
              <Checkbox
                id={`topic-${topic.id}`}
                checked={selectedTopics.includes(topic.id)}
                onCheckedChange={() => toggleTopic(topic.id)}
              />
              <label htmlFor={`topic-${topic.id}`} className="flex-1 cursor-pointer">
                <div className="font-medium">{topic.name}</div>
                {topic.description && <div className="text-sm text-muted-foreground">{topic.description}</div>}
                <div className="text-xs text-muted-foreground mt-1">{topic.question_count} questions</div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked as boolean })}
          />
          <label htmlFor="isPublic" className="cursor-pointer">
            <div className="font-medium">Make this exam public</div>
            <div className="text-sm text-muted-foreground">Public exams can be taken by anyone in the community</div>
          </label>
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Community Exam"}
      </Button>
    </form>
  )
}
