"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Category } from "../types/topic.types"

interface CategorySelectorProps {
  categories: Category[]
  selectedCategory: string | null
  onSelect: (categoryId: string) => void
  className?: string
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
  className,
}: CategorySelectorProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <LucideIcons.AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No categories available. Please select a rating first.</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {categories.map((category, index) => {
        const Icon = (LucideIcons[
          category.icon as keyof typeof LucideIcons
        ] || LucideIcons.FolderOpen) as LucideIcon
        const isSelected = selectedCategory === category.id

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:scale-105",
                "border-2 h-full",
                isSelected
                  ? "border-primary shadow-lg bg-primary/5"
                  : "border-border hover:border-primary/50 hover:shadow-md"
              )}
              onClick={() => onSelect(category.id)}
            >
              <div className="p-5 space-y-3">
                {/* Icon & Badge */}
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isSelected
                        ? "bg-primary/20"
                        : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>

                  {/* Category Badge */}
                  <div
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {category.id}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h4 className="font-semibold text-base mb-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="h-1 bg-primary rounded-full"
                  />
                )}
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
