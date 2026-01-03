"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Plus, TrendingUp, BookOpen, Search } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { CommunityExamsList } from "@/features/exams/components/CommunityExamsList"

interface CommunityExam {
  id: string
  title: string
  description: string | null
  is_featured: boolean
  question_count: number
  difficulty: string
  time_limit: number | null
  rating_average: number
  rating_count: number
  taken_count: number
  topic_ids: string[]
  creator?: {
    display_name: string | null
    email: string
  }
  topics?: Array<{ id: string; code: string; name: string }>
}

interface ExamsClientProps {
  exams: CommunityExam[]
  userId: string | null
}

export function ExamsClient({ exams, userId }: ExamsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter exams based on search query
  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return exams

    const query = searchQuery.toLowerCase()
    return exams.filter((exam) => {
      // Search in title
      if (exam.title.toLowerCase().includes(query)) return true
      
      // Search in description
      if (exam.description?.toLowerCase().includes(query)) return true
      
      // Search in creator name
      if (exam.creator?.display_name?.toLowerCase().includes(query)) return true
      
      // Search in difficulty
      if (exam.difficulty.toLowerCase().includes(query)) return true
      
      // Search in topics
      if (exam.topics?.some(t => 
        t.name.toLowerCase().includes(query) || 
        t.code.toLowerCase().includes(query)
      )) return true
      
      return false
    })
  }, [exams, searchQuery])

  const featuredExams = filteredExams.filter((e) => e.is_featured)
  const regularExams = filteredExams.filter((e) => !e.is_featured)

  return (
    <div className="space-y-6">
      {/* Create Exam Button */}
      {userId && (
        <Link href="/protected/exams/create" className="block">
          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Create Community Exam</span>
          </Button>
        </Link>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by title, creator, topic..."
          className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground px-1">
          Found {filteredExams.length} exam{filteredExams.length !== 1 ? "s" : ""} matching "{searchQuery}"
        </div>
      )}

      {/* Featured Exams */}
      {featuredExams.length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold">Featured Exams</h2>
          </div>
          <CommunityExamsList exams={featuredExams} />
        </section>
      )}

      {/* All Exams */}
      {regularExams.length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-semibold px-1">
            {searchQuery ? "Other Results" : "All Community Exams"}
          </h2>
          <CommunityExamsList exams={regularExams} />
        </section>
      )}

      {/* Empty States */}
      {exams.length === 0 && !searchQuery && (
        <EmptyState
          icon={BookOpen}
          title="No community exams yet"
          description="Community exams allow you to practice with curated question sets created by other users."
          actionLabel={userId ? "Create the First Exam" : "Sign In to Create"}
          actionHref={userId ? "/protected/exams/create" : "/auth/login"}
        />
      )}

      {filteredExams.length === 0 && searchQuery && (
        <EmptyState
          icon={Search}
          title="No exams found"
          description={`No exams match "${searchQuery}". Try different keywords or create a new exam.`}
          actionLabel={userId ? "Create New Exam" : undefined}
          actionHref={userId ? "/protected/exams/create" : undefined}
        />
      )}
    </div>
  )
}
