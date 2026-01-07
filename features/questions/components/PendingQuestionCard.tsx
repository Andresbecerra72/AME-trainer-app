"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, User, Clock, BookOpen, AlertCircle, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { approveQuestion, rejectQuestion } from "@/features/questions/services/pendingQuestion.api"
import { useRouter } from "next/navigation"

interface PendingQuestionCardProps {
  question: any
}

export function PendingQuestionCard({ question }: PendingQuestionCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isHidden, setIsHidden] = useState(false)

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return { label: "Easy", className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" }
      case "medium":
        return { label: "Medium", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" }
      case "hard":
        return { label: "Hard", className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" }
      default:
        return { label: "Unknown", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20" }
    }
  }

  const difficultyConfig = getDifficultyConfig(question.difficulty)

  const answers = [
    { letter: "A", text: question.option_a },
    { letter: "B", text: question.option_b },
    { letter: "C", text: question.option_c },
    { letter: "D", text: question.option_d },
  ]

  const handleApprove = async () => {
    setIsApproving(true)
    
    // Optimistic update - hide card immediately
    setIsHidden(true)
    
    toast({
      title: "Processing...",
      description: "Approving question...",
    })

    try {
      const formData = new FormData()
      formData.append("questionId", question.id)
      formData.append("authorId", question.author_id)
      
      const result = await approveQuestion(formData)
      
      if (result?.success) {
        toast({
          title: "✅ Question approved!",
          description: "The question has been published successfully.",
          variant: "default",
        })

        // Refresh the page to show updated list
        startTransition(() => {
          router.refresh()
        })
      } else {
        throw new Error(result?.error || "Failed to approve question")
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsHidden(false)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to approve question. Please try again.",
        variant: "destructive",
      })
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    
    // Optimistic update - hide card immediately
    setIsHidden(true)
    
    toast({
      title: "Processing...",
      description: "Rejecting question...",
    })

    try {
      const formData = new FormData()
      formData.append("questionId", question.id)
      formData.append("authorId", question.author_id)
      if (rejectionReason.trim()) {
        formData.append("reason", rejectionReason.trim())
      }
      
      const result = await rejectQuestion(formData)
      
      if (result?.success) {
        toast({
          title: "✅ Question rejected",
          description: "The question has been rejected and the author notified.",
        })

        // Refresh the page to show updated list
        startTransition(() => {
          router.refresh()
        })
      } else {
        throw new Error(result?.error || "Failed to reject question")
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsHidden(false)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to reject question. Please try again.",
        variant: "destructive",
      })
      setIsRejecting(false)
    }
  }

  // Hide card after optimistic update
  if (isHidden) {
    return (
      <Card className="overflow-hidden shadow-md border-dashed opacity-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Processing...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 border-b">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{question.author?.full_name || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(question.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {question.topic && (
              <Badge variant="secondary" className="font-mono text-xs">
                <BookOpen className="w-3 h-3 mr-1" />
                {question.topic.code}
              </Badge>
            )}
            <Badge className={`${difficultyConfig.className} border font-medium text-xs`}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {difficultyConfig.label}
            </Badge>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Question Text */}
          <div>
            <h3 className="font-semibold text-base leading-relaxed mb-2">{question.question_text}</h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Answer Options</p>
            {answers.map((answer) => {
              const isCorrect = answer.letter === question.correct_answer
              return (
                <div
                  key={answer.letter}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? "bg-green-50 dark:bg-green-950/30 border-green-500 shadow-sm"
                      : "bg-muted/50 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-background border-2"
                      }`}
                    >
                      {answer.letter}
                    </div>
                    <p className="text-sm leading-relaxed flex-1">{answer.text}</p>
                    {isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Explanation</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-muted/30 border-t">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleApprove}
                disabled={isApproving || isRejecting || isPending}
                className="bg-green-600 hover:bg-green-700 transition-all" 
                size="lg"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button 
                onClick={handleReject}
                disabled={isApproving || isRejecting || isPending}
                variant="destructive" 
                size="lg"
                className="transition-all"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
                📝 Add rejection reason (optional)
              </summary>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this question is being rejected..."
                className="mt-2"
                rows={3}
                disabled={isApproving || isRejecting}
              />
            </details>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
