"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search, Filter, X } from "lucide-react"
import Link from "next/link"
import { deleteTopic } from "@/lib/db-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TopicCard } from "./topic-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Topic {
  id: string
  name: string
  code: string | null
  icon: string | null
  description: string | null
}

export function TopicList({ topics }: { topics: Topic[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()

  // Extract ratings and categories from topics
  const { ratings, categories } = useMemo(() => {
    const ratingsSet = new Set<string>()
    const categoriesMap = new Map<string, Set<string>>()

    topics.forEach((topic) => {
      if (topic.code) {
        const parts = topic.code.split("-")
        if (parts.length >= 2) {
          const rating = parts[0]
          const category = parts[1]
          ratingsSet.add(rating)

          if (!categoriesMap.has(rating)) {
            categoriesMap.set(rating, new Set())
          }
          categoriesMap.get(rating)?.add(category)
        }
      }
    })

    return {
      ratings: Array.from(ratingsSet).sort(),
      categories: categoriesMap,
    }
  }, [topics])

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase())

      // Rating filter
      const matchesRating =
        !selectedRating || topic.code?.startsWith(selectedRating + "-")

      // Category filter
      const matchesCategory =
        !selectedCategory || topic.code?.includes("-" + selectedCategory + "-")

      return matchesSearch && matchesRating && matchesCategory
    })
  }, [topics, searchQuery, selectedRating, selectedCategory])

  // Get categories for selected rating
  const availableCategories = selectedRating
    ? Array.from(categories.get(selectedRating) || []).sort()
    : []

  const openDeleteConfirm = (id: string, name: string) => {
    setTopicToDelete({ id, name })
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!topicToDelete) return

    setIsDeleting(topicToDelete.id)
    const result = await deleteTopic(topicToDelete.id)

    if (result.success) {
      toast({
        title: "Success",
        description: "Topic deleted successfully",
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete topic",
        variant: "destructive",
      })
    }
    setIsDeleting(null)
    setTopicToDelete(null)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedRating(null)
    setSelectedCategory(null)
  }

  const hasActiveFilters = searchQuery || selectedRating || selectedCategory

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics by name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Rating</p>
            {selectedRating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRating(null)
                  setSelectedCategory(null)
                }}
                className="h-7 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ratings.map((rating) => (
              <Badge
                key={rating}
                variant={selectedRating === rating ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedRating === rating && "shadow-md"
                )}
                onClick={() => {
                  setSelectedRating(rating === selectedRating ? null : rating)
                  setSelectedCategory(null)
                }}
              >
                {rating} Rating
              </Badge>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {selectedRating && availableCategories.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Category</p>
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedCategory === category && "shadow-md"
                  )}
                  onClick={() =>
                    setSelectedCategory(
                      category === selectedCategory ? null : category
                    )
                  }
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTopics.length} of {topics.length} topics
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </Card>

      {/* Topics List */}
      {filteredTopics.length === 0 ? (
        <Card className="p-8 text-center">
          <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? "No topics match your filters"
              : "No topics available"}
          </p>
          {hasActiveFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              name={topic.name}
              code={topic.code}
              icon={topic.icon}
              description={topic.description}
              actions={
                <>
                  <Link href={`/admin/topics/${topic.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => openDeleteConfirm(topic.id, topic.name)}
                    disabled={isDeleting === topic.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Delete Topic"
        description={`Are you sure you want to delete "${topicToDelete?.name}"? This action cannot be undone and will affect all questions associated with this topic.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
