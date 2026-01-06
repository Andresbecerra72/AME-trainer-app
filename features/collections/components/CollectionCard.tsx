"use client"

import { MobileCard } from "@/components/mobile-card"
import { Folder, Lock, Globe } from "lucide-react"
import Link from "next/link"
import type { CollectionWithCount } from "../types"

interface CollectionCardProps {
  collection: CollectionWithCount
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/protected/collections/${collection.id}`}>
      <MobileCard className="hover:border-primary transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Folder className="w-5 h-5 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">
                {collection.name}
              </h3>
              {collection.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <span>{collection.questionCount} question{collection.questionCount !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1">
                  {collection.is_public ? (
                    <>
                      <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Private
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </MobileCard>
    </Link>
  )
}
