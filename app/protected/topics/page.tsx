"use client"

import { MobileHeader } from "@/components/mobile-header"
import { TopicCard } from "@/components/topic-card"
import Link from "next/link"
import { Wrench, Plane, Zap, Cpu, Box, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { getAllTopicsClient } from "@/features/topics/services/topic.api"
import { useState, useEffect } from "react"
import { MobileCard } from "@/components/mobile-card"
import { Badge } from "@/components/ui/badge"
import { getSession } from "@/features/auth/services/getSession"
import { UserRole } from "@/lib/types"

const iconMap = {
  wrench: Wrench,
  plane: Plane,
  zap: Zap,
  cpu: Cpu,
  box: Box,
  "book-open": BookOpen,
}

const RATING_CONFIG = {
  M: {
    label: "M Rating",
    description: "Mechanical",
    categories: [
      { id: "SPM", label: "Standard Practices", prefix: "M-SPM" },
      { id: "AF", label: "Airframe", prefix: "M-AF" },
      { id: "PP", label: "Powerplant", prefix: "M-PP" },
    ],
  },
  E: {
    label: "E Rating",
    description: "Electrical/Avionics",
    categories: [
      { id: "SPE", label: "Standard Practices Avionics", prefix: "E-SPE" },
    ],
  },
  S: {
    label: "S Rating",
    description: "Structures",
    categories: [
      { id: "ST", label: "Structures", prefix: "S-ST" },
    ],
  },
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [selectedRating, setSelectedRating] = useState<string>("M")
  const [role, setRole] = useState<UserRole>()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadTopics()
    loadSession()
  }, [])

  const loadSession = async () => {
    const { role: userRole } = await getSession()
    setRole(userRole)
  }

  const loadTopics = async () => {
    const data = await getAllTopicsClient()

    const topicsWithProgress =
      data?.map((topic) => {
        return {
          id: topic.id,
          name: topic.name,
          code: topic.code,
          icon: topic.icon || "book-open",
          progress: 0,
          questionsCount: topic.question_count,
        }
      }) || []
    setTopics(topicsWithProgress)
  }

  const groupedTopics = Object.entries(RATING_CONFIG).reduce((acc, [rating, config]) => {
    acc[rating] = config.categories.map((category) => ({
      ...category,
      topics: topics.filter((topic) => topic.code.startsWith(category.prefix)),
    }))
    return acc
  }, {} as Record<string, any[]>)

  const currentRatingConfig = RATING_CONFIG[selectedRating as keyof typeof RATING_CONFIG]
  const currentCategories = groupedTopics[selectedRating] || []

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Study Topics" showBack />

      <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-muted-foreground text-sm sm:text-base">Select a rating and category to view topics</p>
          <Badge variant="outline" className="w-fit text-xs">
            {topics.length} Total Topics
          </Badge>
        </div>

        {/* Rating Tabs */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(RATING_CONFIG).map(([rating, config]) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 transition-all ${
                selectedRating === rating
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted text-muted-foreground hover:border-primary/50"
              }`}
            >
              <div className="font-semibold text-sm sm:text-base">{config.label}</div>
              <div className="text-xs sm:text-sm opacity-80">{config.description}</div>
            </button>
          ))}
        </div>

        {/* Categories and Topics */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {currentCategories.map((category) => {
            const categoryKey = `${selectedRating}-${category.id}`
            const isExpanded = expandedCategories.has(categoryKey)
            
            return (
              <MobileCard key={categoryKey} className="overflow-hidden h-fit">
                <button
                  type="button"
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base">{category.label}</h3>
                      <div className="mt-1 sm:mt-1.5">
                        <Badge variant="outline" className="text-xs">
                          {category.prefix}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {category.topics.length}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {category.topics.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No topics available</p>
                    ) : (
                      category.topics.map((topic: any) => {
                        const Icon = iconMap[topic.icon as keyof typeof iconMap] || BookOpen
                        return (
                          <Link key={topic.id} href={`/protected/topics/${topic.id}`}>
                            <TopicCard
                              title={topic.name}
                              icon={Icon}
                              progress={topic.progress}
                              questionsCount={topic.questionsCount}
                            />
                          </Link>
                        )
                      })
                    )}
                  </div>
                )}
              </MobileCard>
            )
          })}
        </div>
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
