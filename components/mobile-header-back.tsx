"use client"

import { MobileHeader } from "@/components/mobile-header"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

interface MobileHeaderBackProps {
  title: string
  backUrl?: string
  action?: ReactNode
}

export function MobileHeaderBack({ title, backUrl, action }: MobileHeaderBackProps) {
  const router = useRouter()
  const pathname = usePathname()
  const initialPathRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    // Store the base path without query parameters on first mount
    if (!initialPathRef.current) {
      initialPathRef.current = pathname
    }
  }, [pathname])

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      // Navigate to parent route by removing the last segment
      const pathSegments = (initialPathRef.current || pathname).split("/").filter(Boolean)
      pathSegments.pop()
      const parentPath = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "/"
      router.push(parentPath)
    }
  }

  return <MobileHeader title={title} showBack onBack={handleBack} action={action} />
}
