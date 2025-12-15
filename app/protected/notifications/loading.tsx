import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Notifications" showBack />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <MobileCard key={i}>
              <div className="flex gap-3">
                <Skeleton className="h-5 w-5 rounded flex-shrink-0 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  )
}
