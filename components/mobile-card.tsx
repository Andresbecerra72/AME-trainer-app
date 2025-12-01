"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface MobileCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-xl p-4 shadow-sm border border-border",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform",
        className,
      )}
    >
      {children}
    </div>
  )
}
