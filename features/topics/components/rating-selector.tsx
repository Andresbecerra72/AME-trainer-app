"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Rating, RatingInfo } from "../types/topic.types"

interface RatingSelectorProps {
  ratings: RatingInfo[]
  selectedRating: Rating | null
  onSelect: (rating: Rating) => void
  className?: string
}

export function RatingSelector({
  ratings,
  selectedRating,
  onSelect,
  className,
}: RatingSelectorProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {ratings.map((rating, index) => {
        const Icon = (LucideIcons[
          rating.icon as keyof typeof LucideIcons
        ] || LucideIcons.Circle) as LucideIcon
        const isSelected = selectedRating === rating.id

        return (
          <motion.div
            key={rating.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105",
                "border-2",
                isSelected
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelect(rating.id)}
            >
              {/* Gradient Background */}
              <div
                className={cn(
                  "absolute inset-0 opacity-10 bg-gradient-to-br",
                  rating.color
                )}
              />

              {/* Content */}
              <div className="relative p-6 space-y-4">
                {/* Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                      rating.color,
                      "shadow-md"
                    )}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    >
                      <LucideIcons.Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xl font-bold mb-1">{rating.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {rating.fullName}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rating.description}
                </p>

                {/* Categories count */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LucideIcons.Layers className="h-3.5 w-3.5" />
                  <span>
                    {rating.categories.length}{" "}
                    {rating.categories.length === 1 ? "category" : "categories"}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
