"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { voteQuestion } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface VoteControlsProps {
  questionId: string
  upvotes: number
  downvotes: number
  userVote?: number
}

export function VoteControls({ questionId, upvotes, downvotes, userVote }: VoteControlsProps) {
  const [localUpvotes, setLocalUpvotes] = useState(upvotes)
  const [localDownvotes, setLocalDownvotes] = useState(downvotes)
  const [localUserVote, setLocalUserVote] = useState(userVote)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleVote = async (voteType: number) => {
    setIsLoading(true)
    try {
      await voteQuestion(questionId, voteType)

      // Optimistic update
      if (localUserVote === voteType) {
        // Remove vote
        setLocalUserVote(undefined)
        if (voteType === 1) setLocalUpvotes((prev) => prev - 1)
        else setLocalDownvotes((prev) => prev - 1)
      } else if (localUserVote === -voteType) {
        // Change vote
        setLocalUserVote(voteType)
        if (voteType === 1) {
          setLocalUpvotes((prev) => prev + 1)
          setLocalDownvotes((prev) => prev - 1)
        } else {
          setLocalUpvotes((prev) => prev - 1)
          setLocalDownvotes((prev) => prev + 1)
        }
      } else {
        // New vote
        setLocalUserVote(voteType)
        if (voteType === 1) setLocalUpvotes((prev) => prev + 1)
        else setLocalDownvotes((prev) => prev + 1)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const score = localUpvotes - localDownvotes

  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-background/50 backdrop-blur-sm px-2 py-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={cn(
          "group relative flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-200",
          "hover:bg-green-50 dark:hover:bg-green-950/30 active:scale-95",
          localUserVote === 1 && "bg-green-100 dark:bg-green-950/50"
        )}
        aria-label="Upvote"
      >
        <ThumbsUp
          className={cn(
            "h-4 w-4 transition-all duration-200",
            localUserVote === 1
              ? "fill-green-600 text-green-600 scale-110"
              : "text-muted-foreground group-hover:text-green-600"
          )}
        />
        <span
          className={cn(
            "text-xs font-medium transition-colors",
            localUserVote === 1 ? "text-green-600" : "text-muted-foreground"
          )}
        >
          {localUpvotes}
        </span>
      </button>

      <div className="h-4 w-px bg-border" />

      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={cn(
          "group relative flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-200",
          "hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95",
          localUserVote === -1 && "bg-red-100 dark:bg-red-950/50"
        )}
        aria-label="Downvote"
      >
        <ThumbsDown
          className={cn(
            "h-4 w-4 transition-all duration-200",
            localUserVote === -1
              ? "fill-red-600 text-red-600 scale-110"
              : "text-muted-foreground group-hover:text-red-600"
          )}
        />
        <span
          className={cn(
            "text-xs font-medium transition-colors",
            localUserVote === -1 ? "text-red-600" : "text-muted-foreground"
          )}
        >
          {localDownvotes}
        </span>
      </button>

      <div className="h-4 w-px bg-border" />

      <span
        className={cn(
          "px-2 text-xs font-semibold tabular-nums transition-colors",
          score > 0 && "text-green-600",
          score < 0 && "text-red-600",
          score === 0 && "text-muted-foreground"
        )}
      >
        {score > 0 ? "+" : ""}
        {score}
      </span>
    </div>
  )
}
