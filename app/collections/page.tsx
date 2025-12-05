import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { Folder, Plus, Lock, Globe } from "lucide-react"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getCollections } from "@/lib/db-actions"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { getCurrentUser } from "@/features/auth/services/auth.server"

export default async function CollectionsPage() {
  const {
    data: { user },
  } = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const collections = await getCollections(user.id)

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="My Collections" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Organize your questions into collections</p>
          <Link href="/collections/create">
            <PrimaryButton className="h-8 px-3">
              <Plus className="w-4 h-4 mr-2" />
              New
            </PrimaryButton>
          </Link>
        </div>

        {collections.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No collections yet"
            description="Create your first collection to organize questions by topic or difficulty."
            actionLabel="Create Collection"
            actionHref="/collections/create"
          />
        ) : (
          <div className="space-y-4">
            {collections.map((collection: any) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <MobileCard className="hover:border-primary transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Folder className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{collection.name}</h3>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{collection.question_count?.[0]?.count || 0} questions</span>
                          <span className="flex items-center gap-1">
                            {collection.is_public ? (
                              <>
                                <Globe className="w-3 h-3" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                Private
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </MobileCard>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
