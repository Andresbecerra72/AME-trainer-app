"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Flag, CheckCircle, AlertCircle } from "lucide-react"
import type { QuestionWithDetails } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { ProbabilityMeter } from "@/components/probability-meter"
import { getSignalDetailsForQuestion } from "@/features/questions/examSignals/server/examSignals.actions"
import { calculateExamLikelihood } from "@/features/questions/examSignals/types"
import { renderTopicIcon } from "@/lib/topic-icon"

interface QuestionCardItemWithSignalsProps {
  question: QuestionWithDetails
  showStatus?: boolean
  examSignalData?: {
    count: number
    averageReputation: number
  }
}

export function QuestionCardItemWithSignals({
  question,
  showStatus = false,
  examSignalData,
}: QuestionCardItemWithSignalsProps) {
  const router = useRouter()
  const [signalData, setSignalData] = useState(examSignalData)
  const [isLoadingSignals, setIsLoadingSignals] = useState(!examSignalData)

  useEffect(() => {
    if (examSignalData) return

    let isMounted = true

    const loadSignals = async () => {
      try {
        const data = await getSignalDetailsForQuestion(question.id)
        if (isMounted) {
          setSignalData(data)
          setIsLoadingSignals(false)
        }
      } catch (error) {
        if (isMounted) {
          setSignalData({ count: 0, averageReputation: 0 })
          setIsLoadingSignals(false)
        }
      }
    }

    loadSignals()

    return () => {
      isMounted = false
    }
  }, [examSignalData, question.id])

  const score = question.upvotes - question.downvotes

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const statusIcons = {
    pending: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    approved: <CheckCircle className="h-4 w-4 text-green-500" />,
    rejected: <Flag className="h-4 w-4 text-red-500" />,
  }

  // Calculate exam likelihood with weighted scoring
  const examLikelihoodData = signalData
    ? calculateExamLikelihood(signalData.count, {
        averageUserReputation: signalData.averageReputation,
        questionRating: score,
        isDoubtful: (question as any).is_doubtful || false,
      })
    : { count: 0, likelihood: "none" as const, score: 0 }

  return (
    <Card
      className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/protected/community/questions/${question.id}`)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {/* Vote score */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 sm:min-w-[3rem]">
          <div className="text-xl sm:text-2xl font-bold text-primary">{score}</div>
          <div className="text-xs text-muted-foreground">votes</div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-base flex-1 line-clamp-2">{question.question_text}</h3>
            {showStatus && <div className="flex-shrink-0">{statusIcons[question.status]}</div>}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className={difficultyColors[question.difficulty]}>
              {question.difficulty}
            </Badge>
            {question.topic && (
              <Badge variant="secondary" className="flex max-w-full items-center gap-1 min-w-0">
                <span className="inline-flex items-center">
                  {renderTopicIcon(question.topic.icon, "h-3 w-3")}
                </span>
                <span className="max-w-[10rem] sm:max-w-[14rem] truncate">{question.topic.name}</span>
              </Badge>
            )}
            {question.is_featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
          </div>

          {/* Probability Meter with Exam Signals */}
          {question.status === "approved" && (
            <ProbabilityMeter
              upvotes={question.upvotes}
              downvotes={question.downvotes}
              commentCount={question.comment_count}
              authorReputation={question.author?.reputation || 0}
              examSignalCount={examLikelihoodData.count}
              examLikelihood={examLikelihoodData.likelihood}
              examScore={examLikelihoodData.score}
            />
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.comment_count}</span>
            </div>
            {question.report_count > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <Flag className="h-4 w-4" />
                <span>{question.report_count}</span>
              </div>
            )}
          </div>

          {/* Author */}
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={question.author?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {question.author?.full_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {question.author?.full_name || "Anonymous"} •{" "}
              {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
