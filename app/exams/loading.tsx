import { MobileHeader } from "@/components/mobile-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function ExamsLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Community Exams" showBack />

      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-3">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
