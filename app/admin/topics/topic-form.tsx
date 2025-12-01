"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTopic, updateTopic } from "@/lib/db-actions"
import { toast } from "@/hooks/use-toast"

interface TopicFormProps {
  topic?: {
    id: string
    name: string
    description: string | null
  }
}

export function TopicForm({ topic }: TopicFormProps) {
  const [name, setName] = useState(topic?.name || "")
  const [description, setDescription] = useState(topic?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Topic name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const result = topic
      ? await updateTopic(topic.id, { name, description: description || null })
      : await createTopic({ name, description: description || null })

    if (result.success) {
      toast({
        title: "Success",
        description: topic ? "Topic updated successfully" : "Topic created successfully",
      })
      router.push("/admin/topics")
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save topic",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{topic ? "Edit Topic" : "Create New Topic"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Topic Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aircraft Structures"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this topic..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : topic ? "Update Topic" : "Create Topic"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
