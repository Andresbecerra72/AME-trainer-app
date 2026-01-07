"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Topic {
  id: string
  name: string
  code?: string
}

interface CommunityFiltersProps {
  topics: Topic[]
}

export function CommunityFilters({ topics }: CommunityFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [topic, setTopic] = useState(searchParams.get("topic") || "all")
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all")
  const [sort, setSort] = useState(searchParams.get("sort") || "recent")
  const [showFilters, setShowFilters] = useState(false)

  // Group topics by rating and category
  const groupedTopics = useMemo(() => {
    const groups: Record<string, Record<string, Topic[]>> = {}

    topics.forEach((topic) => {
      if (!topic.code) return

      const parts = topic.code.split("-")
      if (parts.length < 2) return

      const rating = parts[0]
      const category = parts[1]

      if (!groups[rating]) groups[rating] = {}
      if (!groups[rating][category]) groups[rating][category] = []
      groups[rating][category].push(topic)
    })

    return groups
  }, [topics])

  const ratingNames: Record<string, string> = {
    M: "M Rating",
    T: "T Rating",
    E: "E Rating",
  }

  const categoryNames: Record<string, string> = {
    SPM: "Standard Practices",
    AF: "Airframe",
    PP: "Powerplant",
    TG: "Turbine Gas",
    EG: "Electrical General",
    EAV: "Avionics",
  }

  // Get selected topic name for display
  const selectedTopicName = useMemo(() => {
    if (topic === "all") return "All Topics"
    const selected = topics.find((t) => t.id === topic)
    return selected?.code || selected?.name || "All Topics"
  }, [topic, topics])

  // Debounce search
  useEffect(() => {
    if (search === searchParams.get("search")) return
    
    const timer = setTimeout(() => {
      updateFilters({ searchOverride: search })
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const updateFilters = (overrides?: {
    searchOverride?: string
    topicOverride?: string
    difficultyOverride?: string
    sortOverride?: string
  }) => {
    const params = new URLSearchParams()
    
    const finalSearch = overrides?.searchOverride !== undefined ? overrides.searchOverride : search
    const finalTopic = overrides?.topicOverride !== undefined ? overrides.topicOverride : topic
    const finalDifficulty = overrides?.difficultyOverride !== undefined ? overrides.difficultyOverride : difficulty
    const finalSort = overrides?.sortOverride !== undefined ? overrides.sortOverride : sort
    
    if (finalSearch) params.set("search", finalSearch)
    if (finalTopic !== "all") params.set("topic", finalTopic)
    if (finalDifficulty !== "all") params.set("difficulty", finalDifficulty)
    if (finalSort !== "recent") params.set("sort", finalSort)

    startTransition(() => {
      router.push(`/protected/community?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSearch("")
    setTopic("all")
    setDifficulty("all")
    setSort("recent")
    
    startTransition(() => {
      router.push("/protected/community")
    })
  }

  const hasActiveFilters = search || topic !== "all" || difficulty !== "all" || sort !== "recent"

  return (
    <div className="space-y-3 mt-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isPending}
          className="pl-9 sm:pl-10 pr-20 h-10 sm:h-11"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-7 w-7 p-0 ${hasActiveFilters ? "text-primary" : ""}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <Card className="p-3 sm:p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 gap-3">
            {/* Topic Filter - Full Width */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Topic</label>
              <Select
                value={topic}
                onValueChange={(value) => {
                  setTopic(value)
                  updateFilters({ topicOverride: value })
                }}
                disabled={isPending}
              >
                <SelectTrigger className="h-9">
                  <SelectValue>
                    <span className="truncate">{selectedTopicName}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[280px] w-[calc(100vw-2rem)] sm:w-[500px] md:w-[600px]">
                  <SelectItem value="all">
                    <span className="font-medium">All Topics</span>
                  </SelectItem>
                  {Object.entries(groupedTopics).map(([rating, categories]) => (
                    <SelectGroup key={rating}>
                      <SelectLabel className="text-sm font-bold text-primary py-2">
                        {ratingNames[rating] || rating}
                      </SelectLabel>
                      {Object.entries(categories).map(([category, categoryTopics]) => (
                        <div key={category}>
                          <SelectLabel className="pl-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1.5">
                            {categoryNames[category] || category}
                          </SelectLabel>
                          {categoryTopics.map((t) => (
                            <SelectItem key={t.id} value={t.id} className="pl-6">
                              <div className="flex flex-col gap-0.5 py-0.5 w-full min-w-0">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {t.code}
                                </span>
                                <span className="text-sm break-words whitespace-normal leading-tight">
                                  {t.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty and Sort - Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Difficulty Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
                <Select
                  value={difficulty}
                  onValueChange={(value) => {
                    setDifficulty(value)
                    updateFilters({ difficultyOverride: value })
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                <Select
                  value={sort}
                  onValueChange={(value) => {
                    setSort(value)
                    updateFilters({ sortOverride: value })
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="unanswered">Unanswered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full sm:w-auto text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Clear All Filters
            </Button>
          )}
        </Card>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <span>
            {search && `"${search}"`}
            {topic !== "all" && ` • ${topics.find((t) => t.id === topic)?.name || "Topic"}`}
            {difficulty !== "all" && ` • ${difficulty}`}
            {sort !== "recent" && ` • ${sort}`}
          </span>
        </div>
      )}
    </div>
  )
}
