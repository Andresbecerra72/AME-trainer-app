import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { AircraftLoadingAnimation } from "@/components/aircraft-loading"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Profile" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-center min-h-[60vh]">
        <AircraftLoadingAnimation 
          title="Loading profile"
          description="Fetching user data and statistics..."
        />
      </main>

      <BottomNav />
    </div>
  )
}
