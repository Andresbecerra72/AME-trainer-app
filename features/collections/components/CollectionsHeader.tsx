"use client"

import { PrimaryButton } from "@/components/primary-button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function CollectionsHeader() {
  return (
    <div className="flex justify-between items-center gap-3">
      <p className="text-xs sm:text-sm text-muted-foreground flex-1">
        Organize your questions into collections
      </p>
      <Link href="/protected/collections/create">
        <PrimaryButton className="h-8 px-2.5 sm:px-3 text-sm">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">New</span>
        </PrimaryButton>
      </Link>
    </div>
  )
}
