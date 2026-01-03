"use client"

import { Award, Layers } from "lucide-react"
import { MobileCard } from "@/components/mobile-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  getDifficultyColor,
  getRatingCategoryDisplay,
  extractRating,
  extractCategory,
} from "@/features/exams/community-exams.logic"

interface CommunityExam {
  id: string
  title: string
  description: string | null
  question_count: number
  time_limit: number | null
  difficulty: string
  rating_average: number
  rating_count: number
  taken_count: number
  is_featured: boolean
  creator?: {
    display_name: string | null
    email: string
  }
  topic_ids: string[]
  topics?: Array<{ code: string }>
}

interface CommunityExamsListProps {
  exams: CommunityExam[]
  title?: string
  emptyMessage?: string
}

export function CommunityExamsList({ exams, title, emptyMessage }: CommunityExamsListProps) {
  if (exams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">{emptyMessage || "No exams found"}</div>
    )
  }

  return (
    <div className="space-y-3">
      {title && <h2 className="text-base sm:text-lg font-semibold text-foreground px-1">{title}</h2>}
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  )
}

function ExamCard({ exam }: { exam: CommunityExam }) {
  // Extraer rating y categor\u00eda del primer topic
  let ratingInfo: ReturnType<typeof getRatingCategoryDisplay> | null = null
  
  if (exam.topics && exam.topics.length > 0 && exam.topics[0].code) {
    const rating = extractRating(exam.topics[0].code)
    const category = extractCategory(exam.topics[0].code)
    ratingInfo = getRatingCategoryDisplay(rating, category)
  }

  return (
    <Link href={`/protected/exams/${exam.id}`}>
      <MobileCard
        className={`hover:shadow-md transition-all cursor-pointer ${ exam.is_featured ? "border-primary border-2" : ""
        }`}
      >
        <div className="space-y-3">
          {/* Rating and Category */}
          {ratingInfo && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                <Award className="w-3 h-3" />
                <span>{ratingInfo.ratingName}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                <Layers className="w-3 h-3" />
                <span>{ratingInfo.categoryName}</span>
              </div>
              {exam.is_featured && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
          )}

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{exam.title}</h3>
            {exam.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <span className="font-medium">★ {exam.rating_average.toFixed(1)}</span>
              <span>({exam.rating_count})</span>
            </div>
            <div>{exam.taken_count} taken</div>
            {exam.time_limit && <div>{exam.time_limit} min</div>}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {exam.question_count} questions
            </Badge>
            <Badge className={`text-xs ${getDifficultyColor(exam.difficulty)}`}>{exam.difficulty}</Badge>
          </div>

          {/* Creator */}
          {exam.creator && (
            <div className="text-xs text-muted-foreground">
              Created by {exam.creator.display_name || exam.creator.email}
            </div>
          )}
        </div>
      </MobileCard>
    </Link>
  )
}
