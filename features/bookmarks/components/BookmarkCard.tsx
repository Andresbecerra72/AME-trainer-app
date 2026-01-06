"use client"

import { MobileCard } from "@/components/mobile-card"
import { Bookmark, MessageSquare, ThumbsUp } from "lucide-react"
import Link from "next/link"
import type { BookmarkedQuestion } from "../bookmarks.api"

interface BookmarkCardProps {
  bookmark: BookmarkedQuestion
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const question = bookmark.question

  if (!question) return null

  return (
    <Link href={`/protected/community/questions/${question.id}`}>
      <MobileCard className="hover:border-primary transition-colors">
        <div className="space-y-3">
          {/* Question Text */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-balance leading-relaxed line-clamp-2 sm:line-clamp-3">
                {question.question_text}
              </h3>
            </div>
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary flex-shrink-0" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4" />
              <span>{question.upvotes || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{question.comment_count || 0}</span>
            </div>
            {question.topic && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {question.topic.code}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="truncate max-w-[150px] sm:max-w-none">
              by {question.author?.display_name || "Anonymous"}
            </span>
            <span>•</span>
            <span className="whitespace-nowrap">
              {formatDate(bookmark.created_at)}
            </span>
          </div>
        </div>
      </MobileCard>
    </Link>
  )
}
