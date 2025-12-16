import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Bookmark, MessageSquare, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"

export default async function BookmarksPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch bookmarked questions
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(`
      *,
      question:questions(
        *,
        author:users(id, full_name, avatar_url),
        topic:topics(id, name, code)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Bookmarks" showBack />

      <div className="p-4 space-y-4">
        {bookmarks && bookmarks.length > 0 ? (
          <div className="space-y-3">
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
      </div>

      <BottomNav userRole={profile?.role} />
    </div>
  )
}

function BookmarkCard({ bookmark }: { bookmark: any }) {
  const question = bookmark.question

  return (
    <Link href={`/protected/community/questions/${question.id}`}>
      <MobileCard className="hover:border-primary transition-colors">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-balance leading-relaxed line-clamp-2">{question.question_text}</h3>
            </div>
            <Bookmark className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{question.votes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{question.comments_count || 0}</span>
            </div>
            {question.topic && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {question.topic.code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>by {question.author?.full_name || "Anonymous"}</span>
            <span>•</span>
            <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </MobileCard>
    </Link>
  )
}
