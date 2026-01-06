import { MobileHeader } from "@/components/mobile-header"
import { Folder } from "lucide-react"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { getSession } from "@/features/auth/services/getSession"
import { getUserCollections } from "@/features/collections/services/collections.api"
import { CollectionsHeader } from "@/features/collections/components/CollectionsHeader"
import { CollectionCard } from "@/features/collections/components/CollectionCard"
import { getUserUnreadNotifications } from "@/features/notifications/services/notifications.server"

export default async function CollectionsPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  const collections = await getUserCollections(user.id)
  const { count: unreadNotifications } = await getUserUnreadNotifications(user.id)

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="My Collections" showBack />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        <CollectionsHeader />

        {collections.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No collections yet"
            description="Create your first collection to organize questions by topic or difficulty."
            actionLabel="Create Collection"
            actionHref="/protected/collections/create"
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>

      <BottomNav userRole={role} unreadNotifications={unreadNotifications || 0} />
    </div>
  )
}
