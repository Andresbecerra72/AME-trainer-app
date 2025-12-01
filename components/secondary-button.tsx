"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SecondaryButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  fullWidth?: boolean
}

export function SecondaryButton({
  children,
  onClick,
  className,
  disabled,
  type = "button",
  fullWidth = false,
}: SecondaryButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={cn("h-12 text-base font-medium rounded-xl border-2", fullWidth && "w-full", className)}
    >
      {children}
    </Button>
  )
}
