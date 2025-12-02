"use client"

import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { EmptyState } from "@/components/empty-state"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { getCurrentUser } from "@/features/auth/services/auth.server"
import { supabaseBrowserClient } from "@/lib/supabase/client"
//TODO: Refactor to use server components where possible
async function CommunityContent({
  searchParams,
}: {
  searchParams: { search?: string; topic?: string; difficulty?: string; status?: string; sort?: string }
}) {

  const {
    data: { user },
  } = await getCurrentUser()
  let userRole: "user" | "admin" | "super_admin" = "user"

  if (user) {
    const { data: profile } = await supabaseBrowserClient.from("users").select("role").eq("id", user.id).single()
    userRole = profile?.role || "user"
  }

  // Fetch topics
  const { data: topics } = await supabaseBrowserClient.from("topics").select("*").order("name")

  // Fetch questions with filters
  let query = supabaseBrowserClient
    .from("questions")
    .select(`
      *,
      author:users(id, full_name, avatar_url),
      topic:topics(id, name, code)
    `)
    .eq("status", searchParams.status || "approved")

  if (searchParams.sort === "popular") {
    query = query.order("views_count", { ascending: false })
  } else if (searchParams.sort === "discussed") {
    query = query.order("comments_count", { ascending: false })
  } else if (searchParams.sort === "unanswered") {
    query = query.order("answers_count", { ascending: true })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  if (searchParams.search) {
    query = query.ilike("question_text", `%${searchParams.search}%`)
  }

  if (searchParams.topic && searchParams.topic !== "all") {
    query = query.eq("topic_id", searchParams.topic)
  }

  if (searchParams.difficulty && searchParams.difficulty !== "all") {
    query = query.eq("difficulty", searchParams.difficulty)
  }

  const { data: questions } = await query

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Community Questions" showBack={false} />

      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-10"
              defaultValue={searchParams.search}
              name="search"
            />
          </div>

          <div className="flex gap-2">
            <Select defaultValue={searchParams.topic || "all"}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics && topics.map((topic) => (
                  <SelectItem key={topic['id']} value={topic['id']}>
                    {topic['name']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue={searchParams.difficulty || "all"}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select defaultValue={searchParams.sort || "recent"}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="discussed">Most Discussed</SelectItem>
              <SelectItem value="unanswered">Needs Answers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Question Button */}
        <Link href="/community/add-question">
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Submit a Question
          </Button>
        </Link>

        {/* Questions List */}
        <div className="space-y-3">
          {questions && questions.length > 0 ? (
            questions.map((question) => (
              <Link key={question.id} href={`/community/questions/${question.id}`}>
                <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="space-y-3">
                    <h3 className="font-medium text-balance leading-relaxed line-clamp-2">{question.question_text}</h3>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{question.comments_count || 0}</span>
                      </div>
                      {question.topic && (
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {question.topic.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>by {question.author?.full_name || "Anonymous"}</span>
                      <span>{new Date(question.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              icon={MessageCircle}
              title="No questions found"
              description="Be the first to contribute and help the community!"
              actionLabel="Submit a Question"
              actionHref="/community/add-question"
            />
          )}
        </div>
      </div>

      <BottomNav userRole={userRole} />
    </div>
  )
}

export default function CommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [topic, setTopic] = useState(searchParams.get("topic") || "all")
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent")
  const [userRole, setUserRole] = useState<"user" | "admin" | "super_admin">("user")

  const handleFilterChange = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (topic !== "all") params.set("topic", topic)
    if (difficulty !== "all") params.set("difficulty", difficulty)
    if (sortBy !== "recent") params.set("sort", sortBy)

    startTransition(() => {
      router.push(`/community?${params.toString()}`)
    })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Community Questions" showBack={false} />

      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                // Debounced search would go here
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFilterChange()
              }}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={topic}
              onValueChange={(v) => {
                setTopic(v)
                handleFilterChange()
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {/* Topics from server */}
              </SelectContent>
            </Select>

            <Select
              value={difficulty}
              onValueChange={(v) => {
                setDifficulty(v)
                handleFilterChange()
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v)
              handleFilterChange()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="discussed">Most Discussed</SelectItem>
              <SelectItem value="unanswered">Needs Answers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Questions List */}
        <Suspense fallback={<div>Loading...</div>}>
          <CommunityContent searchParams={{ search, topic, difficulty, sort: sortBy }} />
        </Suspense>
      </div>

      <BottomNav userRole={userRole} />
    </div>
  )
}
