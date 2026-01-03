"use client"

import { Calendar, Clock, Award, Layers } from "lucide-react"
import { MobileCard } from "@/components/mobile-card"
import {
  getScoreColor,
  formatExamTime,
  formatExamDate,
  getExamRatingAndCategory,
} from "@/features/exams/exam-history.logic"
import type { ExamHistoryRecord } from "@/features/exams/exam-history.logic"

interface ExamHistoryListProps {
  examHistory: ExamHistoryRecord[]
}

export function ExamHistoryList({ examHistory }: ExamHistoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-foreground px-1">Recent Exams</h2>
      {examHistory.map((exam) => {
        const scoreColor = getScoreColor(exam.score_percentage)
        const examInfo = getExamRatingAndCategory(exam)

        return (
          <MobileCard key={exam.id}>
            <div className="space-y-3">
              {/* Rating and Category Badge */}
              {examInfo && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                    <Award className="w-3 h-3" />
                    <span>{examInfo.ratingName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                    <Layers className="w-3 h-3" />
                    <span>{examInfo.categoryName}</span>
                  </div>
                </div>
              )}

              {/* Score and Correct Answers */}
              <div className="flex items-center justify-between">
                <div className={`text-2xl sm:text-3xl font-bold ${scoreColor.text}`}>
                  {exam.score_percentage}%
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div className="font-medium">
                    {exam.correct_answers}/{exam.question_count}
                  </div>
                  <div className="text-xs">correct</div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatExamDate(exam.completed_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatExamTime(exam.time_taken)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${scoreColor.bg}`}
                  style={{ width: `${exam.score_percentage}%` }}
                />
              </div>
            </div>
          </MobileCard>
        )
      })}
    </div>
  )
}
