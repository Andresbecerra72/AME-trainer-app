"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { CommunityQuestionCard } from "./CommunityQuestionCard"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation?: string | null
  difficulty: "easy" | "medium" | "hard"
  comments_count?: number
  views_count?: number
  upvotes?: number
  downvotes?: number
  created_at: string
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
  topic?: {
    id: string
    name: string
    code: string
  } | null
}

interface CategorySectionProps {
  categoryName: string
  categoryCode: string
  questions: Question[]
  defaultExpanded?: boolean
}

export function CategorySection({ 
  categoryName, 
  categoryCode, 
  questions,
  defaultExpanded = false 
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const questionCount = questions.length
  const difficulties = {
    easy: questions.filter(q => q.difficulty === "easy").length,
    medium: questions.filter(q => q.difficulty === "medium").length,
    hard: questions.filter(q => q.difficulty === "hard").length,
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between",
          "hover:bg-muted/50 transition-colors",
          isExpanded && "bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono bg-primary/5">
                {categoryCode}
              </Badge>
              <span className="text-sm font-bold text-primary">
                {questionCount} {questionCount === 1 ? "Question" : "Questions"}
              </span>
            </div>
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {categoryName}
            </h3>
            
            {/* Difficulty Distribution */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {difficulties.easy > 0 && (
                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                  {difficulties.easy} Easy
                </Badge>
              )}
              {difficulties.medium > 0 && (
                <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                  {difficulties.medium} Medium
                </Badge>
              )}
              {difficulties.hard > 0 && (
                <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">
                  {difficulties.hard} Hard
                </Badge>
              )}
            </div>
          </div>

          {/* Expand Icon */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Questions List */}
      {isExpanded && (
        <div className="border-t bg-muted/20">
          <div className="p-3 sm:p-4 space-y-3">
            {questions.map((question) => (
              <CommunityQuestionCard key={question.id} question={question} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
