"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTopicAction, updateTopicAction } from "@/features/topics/services/topic.server"
import { toast } from "@/hooks/use-toast"
import { Loader2, Eye } from "lucide-react"
import { IconPicker } from "@/components/shared/icon-picker"
import { TopicCard } from "./topic-card"

interface TopicFormProps {
  topic?: {
    id: string
    name: string
    description: string | null
    code: string | null
    icon: string | null
  }
}

export function TopicForm({ topic }: TopicFormProps) {
  const [name, setName] = useState(topic?.name || "")
  const [description, setDescription] = useState(topic?.description || "")
  const [code, setCode] = useState(topic?.code || "")
  const [icon, setIcon] = useState(topic?.icon || "")
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

    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Topic code is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const topicData = {
        name,
        description: description || undefined,
        code: code || undefined,
        icon: icon || undefined,
      }

      if (topic) {
        await updateTopicAction(topic.id, topicData)
      } else {
        await createTopicAction(topicData)
      }

      toast({
        title: "Success",
        description: topic ? "Topic updated successfully" : "Topic created successfully",
      })
      
      router.push("/admin/topics")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save topic",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>{topic ? "Edit Topic" : "Create New Topic"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="code">Topic Code *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g., AS101"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon (Optional)</Label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this topic..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  topic ? "Update Topic" : "Create Topic"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview en tiempo real */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>Live Preview</span>
        </div>
        <TopicCard
          name={name || "Topic Name"}
          code={code || null}
          icon={icon || null}
          description={description || null}
        />
      </div>
    </div>
  )
}
