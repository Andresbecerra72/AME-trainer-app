import { MobileHeader } from "@/components/mobile-header"
import { notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { getProfileData } from "@/features/profiles/services/profile.api"
import { ProfileHeader } from "@/features/profiles/components/ProfileHeader"
import { ProfileActions } from "@/features/profiles/components/ProfileActions"
import { ProfileBadges } from "@/features/profiles/components/ProfileBadges"
import { ProfileStatsGrid } from "@/features/profiles/components/ProfileStatsGrid"
import { RecentActivity } from "@/features/profiles/components/RecentActivity"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id: paramId } = await params
  const { user, profile: currentUserProfile } = await getSession()

  if (!currentUserProfile) {
    notFound()
  }

  // Use current user's ID if viewing own profile or if no valid ID provided
  const profileId = paramId && paramId !== "me" ? paramId : user?.id

  if (!profileId) {
    notFound()
  }

  const profileData = await getProfileData(profileId)

  if (!profileData) {
    notFound()
  }

  const { profile, stats, badgeLevel, questions, badges } = profileData

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Profile" showBack />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          displayName={profile.display_name}
          email={profile.email}
          avatarUrl={profile.avatar_url}
          badgeLevel={badgeLevel}
        />

        {/* Profile Actions */}
        <ProfileActions userId={profileId} />

        {/* Logout Button */}
        <LogoutButton />

        {/* Badges */}
        <ProfileBadges badges={badges} />

        {/* Stats Grid */}
        <ProfileStatsGrid stats={stats} />

        {/* Recent Activity */}
        <RecentActivity questions={questions} />
      </div>

      <BottomNav userRole={currentUserProfile.role} />
    </div>
  )
}
