"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface Topic {
  id: string
  name: string
  code: string
  description?: string
}

interface TopicSelectorProps {
  topics: Topic[]
  selectedTopicId: string
  onSelectTopic: (topicId: string) => void
}

const RATINGS = [
  { id: "M", label: "M Rating", description: "Mechanical" },
  { id: "E", label: "E Rating", description: "Electrical/Avionics" },
  { id: "S", label: "S Rating", description: "Structures" },
]

const CATEGORIES = {
  M: [
    { id: "SPM", label: "Standard Practices", prefix: "M-SPM" },
    { id: "AF", label: "Airframe", prefix: "M-AF" },
    { id: "PP", label: "Powerplant", prefix: "M-PP" },
  ],
  E: [
    { id: "SPE", label: "Standard Practices Avionics", prefix: "E-SPE" },
  ],
  S: [
    { id: "ST", label: "Structures", prefix: "S-ST" },
  ],
}

export function TopicSelector({ topics, selectedTopicId, onSelectTopic }: TopicSelectorProps) {
  const [selectedRating, setSelectedRating] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])

  // Si hay un topic seleccionado, inicializar los filtros basados en su código
  useEffect(() => {
    if (selectedTopicId && topics.length > 0) {
      const topic = topics.find(t => t.id === selectedTopicId)
      if (topic?.code) {
        const rating = topic.code.split("-")[0]
        const category = topic.code.split("-").slice(0, 2).join("-")
        setSelectedRating(rating)
        setSelectedCategory(category)
      }
    }
  }, [selectedTopicId, topics])

  // Filtrar topics cuando cambian rating o categoría
  useEffect(() => {
    if (selectedCategory) {
      const filtered = topics.filter(topic => 
        topic.code.startsWith(selectedCategory)
      )
      setFilteredTopics(filtered)
    } else {
      setFilteredTopics([])
    }
  }, [selectedCategory, topics])

  const handleRatingChange = (ratingId: string) => {
    setSelectedRating(ratingId)
    setSelectedCategory("")
    onSelectTopic("")
  }

  const handleCategoryChange = (prefix: string) => {
    setSelectedCategory(prefix)
    onSelectTopic("")
  }

  const handleTopicSelect = (topicId: string) => {
    onSelectTopic(topicId)
  }

  const categories = selectedRating ? CATEGORIES[selectedRating as keyof typeof CATEGORIES] || [] : []

  return (
    <div className="space-y-4">
      {/* Rating Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">1. Select Rating</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {RATINGS.map((rating) => (
            <button
              key={rating.id}
              type="button"
              onClick={() => handleRatingChange(rating.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedRating === rating.id
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{rating.label}</div>
                  <div className="text-xs text-muted-foreground">{rating.description}</div>
                </div>
                {selectedRating === rating.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      {selectedRating && categories.length > 0 && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <Label className="text-sm font-semibold">2. Select Category</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.prefix)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedCategory === category.prefix
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-xs truncate">{category.label}</div>
                    <Badge variant="outline" className="mt-0.5 text-[10px] px-1.5 py-0">
                      {category.prefix}
                    </Badge>
                  </div>
                  {selectedCategory === category.prefix && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topic Selection */}
      {selectedCategory && filteredTopics.length > 0 && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <Label className="text-sm font-semibold">
            3. Select Topic <span className="text-muted-foreground font-normal">({filteredTopics.length})</span>
          </Label>
          <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicSelect(topic.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTopicId === topic.id
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs mb-0.5">{topic.name}</div>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {topic.code}
                    </Badge>
                  </div>
                  {selectedTopicId === topic.id && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedRating && !selectedCategory && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">Please select a category to see available topics</p>
        </div>
      )}
    </div>
  )
}
