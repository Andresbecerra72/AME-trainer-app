"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createComment } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"
import type { Comment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface CommentListProps {
  questionId: string
  comments: Comment[]
  currentUserId?: string
}

export function CommentList({ questionId, comments, currentUserId }: CommentListProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await createComment(questionId, newComment)
      setNewComment("")
      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            Post Comment
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-3 bg-card rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author?.avatar_url || undefined} />
              <AvatarFallback>{comment.author?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{comment.author?.display_name || "Anonymous"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
