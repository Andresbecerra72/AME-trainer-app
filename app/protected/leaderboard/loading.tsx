import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy } from "lucide-react"

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Leaderboard" showBack />

      <div className="p-4 space-y-4">
        <MobileCard>
          <div className="text-center py-4">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h2 className="text-xl font-bold">Top Contributors</h2>
            <p className="text-sm text-muted-foreground mt-1">Earn points by helping the community</p>
          </div>
        </MobileCard>

        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <MobileCard key={i}>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  )
}
