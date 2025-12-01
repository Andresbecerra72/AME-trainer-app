import { MobileHeader } from "@/components/mobile-header"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PendingLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Pending Questions" showBack />

      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
