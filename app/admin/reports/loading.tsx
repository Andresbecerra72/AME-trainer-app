import { MobileHeader } from "@/components/mobile-header"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Reports" showBack />

      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2 items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
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
