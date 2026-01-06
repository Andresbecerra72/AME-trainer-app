import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { Bookmark } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { getUserBookmarks } from "@/features/bookmarks/bookmarks.api"
import { BookmarkCard } from "@/features/bookmarks/components/BookmarkCard"
import { getSession } from "@/features/auth/services/getSession"

export default async function BookmarksPage() {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch bookmarks using business logic
  const bookmarks = await getUserBookmarks(user.id)

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Bookmarks" showBack />

      <main className="container max-w-3xl mx-auto px-4 py-4 sm:py-6">
        {bookmarks && bookmarks.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm text-muted-foreground">
              {bookmarks.length} saved question{bookmarks.length !== 1 ? "s" : ""}
            </p>
            {bookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Save questions for later by tapping the bookmark icon on any question."
            actionLabel="Browse Questions"
            actionHref="/protected/community"
          />
        )}
      </main>

      <BottomNav userRole={role} />
    </div>
  )
}

