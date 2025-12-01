"use client"

import { cn } from "@/lib/utils"

interface SegmentedControlProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn("inline-flex bg-muted rounded-xl p-1 gap-1", className)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            value === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
