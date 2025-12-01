import { MobileHeader } from "@/components/mobile-header"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Loading..." showBack />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </Card>

        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-36" />
          </div>
        </Card>

        <Skeleton className="h-12 w-full" />
      </main>
    </div>
  )
}
