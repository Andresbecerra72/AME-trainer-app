"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface PrimaryButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  fullWidth?: boolean
}

export function PrimaryButton({
  children,
  onClick,
  className,
  disabled,
  type = "button",
  fullWidth = false,
}: PrimaryButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium rounded-xl shadow-md",
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </Button>
  )
}
