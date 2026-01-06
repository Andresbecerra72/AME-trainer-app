import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { redirect, notFound } from "next/navigation"
import { getSession } from "@/features/auth/services/getSession"
import { getCollection } from "@/lib/db-actions"
import { EmptyState } from "@/components/empty-state"
import { FileQuestion, Lock, Globe } from "lucide-react"
import { MobileCard } from "@/components/mobile-card"
import Link from "next/link"
import { getUserUnreadNotifications } from "@/features/notifications/services/notifications.server"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { user, role } = await getSession()

  if (!user) {
    redirect("/public/auth/login")
  }

  const { id } = await params
  const collection = await getCollection(id)

  if (!collection) {
    notFound()
  }

  // Check if user owns the collection or if it's public
  if (collection.user_id !== user.id && !collection.is_public) {
    redirect("/protected/collections")
  }

  const { count: unreadNotifications } = await getUserUnreadNotifications(user.id)
  const questions = collection.questions || []

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title={collection.name} showBack />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        {/* Collection Info */}
        <MobileCard>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {collection.name}
              </h2>
              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                {collection.is_public ? (
                  <>
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Private
                  </>
                )}
              </span>
            </div>

            {collection.description && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}

            <div className="pt-2 border-t border-border text-xs sm:text-sm text-muted-foreground">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </MobileCard>

        {/* Questions List */}
        {questions.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No questions yet"
            description="Add questions to this collection to start organizing your study materials."
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {questions.map((item: any) => {
              const question = item.question
              if (!question) return null

              return (
                <Link key={item.id} href={`/protected/community/questions/${question.id}`}>
                  <MobileCard className="hover:border-primary transition-colors">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">
                        {question.question_text}
                      </h3>

                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        {question.topic && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {question.topic.code || question.topic.name}
                          </span>
                        )}
                        {question.author && (
                          <span className="truncate max-w-[150px] sm:max-w-none">
                            by {question.author.display_name || "Anonymous"}
                          </span>
                        )}
                      </div>
                    </div>
                  </MobileCard>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav userRole={role} unreadNotifications={unreadNotifications || 0} />
    </div>
  )
}
