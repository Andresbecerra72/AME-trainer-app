"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import { voteQuestion } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"

interface VoteButtonProps {
  questionId: string
  upvotes: number
  downvotes: number
  userVote?: number
}

export function VoteButton({ questionId, upvotes, downvotes, userVote }: VoteButtonProps) {
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
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={localUserVote === 1 ? "text-primary" : ""}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <span className="text-sm font-semibold">{score}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={localUserVote === -1 ? "text-destructive" : ""}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  )
}
