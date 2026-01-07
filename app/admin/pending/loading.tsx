import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { AircraftLoadingAnimation } from "@/components/aircraft-loading"

export default function PendingLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Pending Questions" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-center min-h-[60vh]">
        <AircraftLoadingAnimation 
          title="Loading pending queue"
          description="Fetching questions awaiting review..."
        />
      </main>

      <BottomNav />
    </div>
  )
}
