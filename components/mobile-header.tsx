"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  action?: ReactNode
}

export function MobileHeader({ title, showBack = true, onBack, action }: MobileHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1 -ml-1 hover:bg-primary-foreground/10 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        {action && <div className="ml-2">{action}</div>}
      </div>
    </header>
  )
}
