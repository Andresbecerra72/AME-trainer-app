import { MobileHeader } from "@/components/mobile-header"
import { Skeleton } from "@/components/ui/skeleton"
import { MobileCard } from "@/components/mobile-card"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Profile" showBack />

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <MobileCard>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </MobileCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <MobileCard key={i}>
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </MobileCard>
          ))}
        </div>

        {/* Activity */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          {[...Array(5)].map((_, i) => (
            <MobileCard key={i}>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  )
}
