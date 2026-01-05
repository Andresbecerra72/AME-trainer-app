import { Suspense } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CommunityContent } from "@/features/community/components/CommunityContent"
import { CommunityFilters } from "@/features/community/components/CommunityFilters"
import { getTopics } from "@/lib/db-actions"
import { getSession } from "@/features/auth/services/getSession"

type SearchParamsType = Promise<{ [key: string]: string | string[] | undefined }>

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: SearchParamsType
}) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const topic = typeof params.topic === "string" ? params.topic : "all"
  const difficulty = typeof params.difficulty === "string" ? params.difficulty : "all"
  const sort = typeof params.sort === "string" ? params.sort : "recent"
  
  const topics = await getTopics()
  const { profile } = await getSession()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Community Questions" showBack={false} />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Add Question Button */}
        {profile && (
          <Link href="/protected/community/add-question">
            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Add Question</span>
            </Button>
          </Link>
        )}

        {/* Filters */}
        <CommunityFilters topics={topics} />

        {/* Questions List */}
        <Suspense fallback={<div className="text-center py-8">Loading questions...</div>}>
          <CommunityContent search={search} topic={topic} difficulty={difficulty} sort={sort} />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  )
}
