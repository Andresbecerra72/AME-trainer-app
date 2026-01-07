import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { AircraftLoadingAnimation } from "@/components/aircraft-loading"

export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Reports" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-center min-h-[60vh]">
        <AircraftLoadingAnimation 
          title="Loading reports"
          description="Fetching reported content and moderation queue..."
        />
      </main>

      <BottomNav />
    </div>
  )
}
