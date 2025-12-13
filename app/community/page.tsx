import { Suspense } from "react"
import { CommunityContent } from "@/features/community/components/CommunityContent"
import { ClientCommunityPage } from "@/features/community/components/ClientCommunityPage"
import { getTopics } from "@/lib/db-actions"

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <ClientCommunityPage
        initialSearch={search}
        initialTopic={topic}
        initialDifficulty={difficulty}
        initialSort={sort}
        initialTopics={topics}
      />

      <Suspense fallback={<div>Loading questions...</div>}>
        <CommunityContent
          search={search}
          topic={topic}
          difficulty={difficulty}
          sort={sort}
        />
      </Suspense>
    </div>
  )
}
