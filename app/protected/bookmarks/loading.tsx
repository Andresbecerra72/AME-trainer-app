import { MobileHeader } from "@/components/mobile-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function BookmarksLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Bookmarks" showBack />

      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
