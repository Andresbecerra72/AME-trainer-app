"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitMerge, AlertTriangle, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DuplicateItem {
  question1: {
    id: string
    question_text: string
    upvotes: number
    comment_count: number
    author?: {
      full_name?: string | null
      display_name?: string | null
    }
  }
  question2: {
    id: string
    question_text: string
    upvotes: number
    comment_count: number
    author?: {
      full_name?: string | null
      display_name?: string | null
    }
  }
  similarity: number
}

type SimilarityRange = "critical" | "high" | "medium" | "low"

interface SimilarityTab {
  id: SimilarityRange
  label: string
  range: [number, number]
  icon: typeof AlertTriangle
  color: string
  bgColor: string
  borderColor: string
  badgeVariant: "destructive" | "default" | "secondary" | "outline"
}

const SIMILARITY_TABS: SimilarityTab[] = [
  {
    id: "critical",
    label: "Critical",
    range: [90, 100],
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/50",
    badgeVariant: "destructive",
  },
  {
    id: "high",
    label: "High",
    range: [70, 89],
    icon: AlertCircle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/50",
    badgeVariant: "default",
  },
  {
    id: "medium",
    label: "Medium",
    range: [50, 69],
    icon: Info,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/50",
    badgeVariant: "secondary",
  },
  {
    id: "low",
    label: "Low",
    range: [0, 49],
    icon: GitMerge,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/50",
    badgeVariant: "outline",
  },
]

function getSimilarityRange(similarity: number): SimilarityRange {
  if (similarity >= 90) return "critical"
  if (similarity >= 70) return "high"
  if (similarity >= 50) return "medium"
  return "low"
}

function getSimilarityTabConfig(range: SimilarityRange): SimilarityTab {
  return SIMILARITY_TABS.find((tab) => tab.id === range) || SIMILARITY_TABS[3]
}

export function DuplicatesFilterTabs({ duplicates }: { duplicates: DuplicateItem[] }) {
  const [activeTab, setActiveTab] = useState<SimilarityRange | "all">("all")

  // Group and count duplicates by similarity range
  const groupedDuplicates = useMemo(() => {
    const groups: Record<SimilarityRange, DuplicateItem[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    }

    duplicates.forEach((duplicate) => {
      const range = getSimilarityRange(duplicate.similarity)
      groups[range].push(duplicate)
    })

    return groups
  }, [duplicates])

  // Filter duplicates based on active tab
  const filteredDuplicates = useMemo(() => {
    if (activeTab === "all") return duplicates
    return groupedDuplicates[activeTab]
  }, [activeTab, duplicates, groupedDuplicates])

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Duplicates Found</h3>
            <p className="text-3xl font-bold">{duplicates.length}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <GitMerge className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Mini stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {SIMILARITY_TABS.map((tab) => {
            const count = groupedDuplicates[tab.id].length
            const Icon = tab.icon
            return (
              <div
                key={tab.id}
                className={cn(
                  "rounded-lg p-2 border transition-all",
                  tab.bgColor,
                  tab.borderColor
                )}
              >
                <Icon className={cn("h-3 w-3 mb-1", tab.color)} />
                <p className="text-xs font-medium">{count}</p>
                <p className="text-[10px] text-muted-foreground truncate">{tab.label}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className="flex-shrink-0"
        >
          All
          <Badge variant="secondary" className="ml-2">
            {duplicates.length}
          </Badge>
        </Button>

        {SIMILARITY_TABS.map((tab) => {
          const Icon = tab.icon
          const count = groupedDuplicates[tab.id].length
          const isActive = activeTab === tab.id

          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn("flex-shrink-0 gap-2", isActive && tab.bgColor)}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredDuplicates.length}</span>{" "}
          {activeTab !== "all" && (
            <>
              <span className="lowercase">{SIMILARITY_TABS.find((t) => t.id === activeTab)?.label}</span> priority
            </>
          )}{" "}
          duplicate{filteredDuplicates.length !== 1 ? "s" : ""}
        </p>
        {activeTab !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("all")}>
            Clear filter
          </Button>
        )}
      </div>

      {/* Duplicates List */}
      {filteredDuplicates.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <GitMerge className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No duplicates found in this range
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDuplicates.map((duplicate, index) => {
            const rangeConfig = getSimilarityTabConfig(getSimilarityRange(duplicate.similarity))
            const Icon = rangeConfig.icon

            return (
              <Card
                key={index}
                className={cn(
                  "p-4 space-y-4 transition-all hover:shadow-md border-l-4",
                  rangeConfig.borderColor
                )}
              >
                {/* Header with similarity badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        rangeConfig.bgColor
                      )}
                    >
                      <Icon className={cn("h-4 w-4", rangeConfig.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant={rangeConfig.badgeVariant} className="font-mono">
                        {duplicate.similarity}% Match
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rangeConfig.label} Priority
                      </p>
                    </div>
                  </div>

                  <Link href={`/admin/duplicates/${duplicate.question1.id}/${duplicate.question2.id}`}>
                    <Button size="sm" className="flex-shrink-0">
                      <GitMerge className="h-3.5 w-3.5 mr-2" />
                      Review
                    </Button>
                  </Link>
                </div>

                {/* Questions comparison */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Question 1
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>👍 {duplicate.question1.upvotes}</span>
                        <span>💬 {duplicate.question1.comment_count || 0}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium line-clamp-3 mb-2">
                      {duplicate.question1.question_text}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      by {duplicate.question1.author?.full_name || duplicate.question1.author?.display_name || "Unknown"}
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Question 2
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>👍 {duplicate.question2.upvotes}</span>
                        <span>💬 {duplicate.question2.comment_count || 0}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium line-clamp-3 mb-2">
                      {duplicate.question2.question_text}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      by {duplicate.question2.author?.full_name || duplicate.question2.author?.display_name || "Unknown"}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
