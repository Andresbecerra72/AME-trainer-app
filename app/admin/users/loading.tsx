import { MobileHeader } from "@/components/mobile-header"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="User Management" showBack />

      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </Card>
        ))}
      </div>
    </div>
  )
}
