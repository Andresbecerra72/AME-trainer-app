"use client"

import { MobileHeader } from "@/components/mobile-header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ClientCommunityPageProps {
  initialSearch: string
  initialTopic: string
  initialDifficulty: string
  initialSort: string
  initialTopics?: Array<{ id: string; name: string; code?: string }>
}

export function ClientCommunityPage({
  initialSearch,
  initialTopic,
  initialDifficulty,
  initialSort,
  initialTopics = [],
}: ClientCommunityPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [topic, setTopic] = useState(initialTopic)
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [sortBy, setSortBy] = useState(initialSort)
  const [userRole] = useState<"user" | "admin" | "super_admin">("user")

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
    <>
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
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFilterChange()
              }}
              disabled={isPending}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={topic}
              onValueChange={(v) => {
                setTopic(v)
                handleFilterChange()
              }}
              disabled={isPending}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {initialTopics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={difficulty}
              onValueChange={(v) => {
                setDifficulty(v)
                handleFilterChange()
              }}
              disabled={isPending}
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
            disabled={isPending}
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

        {/* Add Question Button */}
        <Link href="/community/add-question">
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Submit a Question
          </Button>
        </Link>
      </div>

      <BottomNav userRole={userRole} />
    </>
  )
}
