import { MobileHeader } from "@/components/mobile-header"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { QuestionCardItem } from "@/components/question-card-item"
import { BottomNav } from "@/components/bottom-nav"

export default async function TopicQuestionsPage({
  params,
  searchParams,
}: { params: { slug: string }; searchParams: { search?: string; filter?: string } }) {
  const supabase = await createClient()
  const searchQuery = searchParams.search || ""
  const filter = searchParams.filter || "all"

  // Get topic by slug
  const { data: topic } = await supabase.from("topics").select("*").eq("slug", params.slug).single()

  if (!topic) {
    return <div>Topic not found</div>
  }

  // Build query
  let query = supabase
    .from("questions")
    .select("*, topic:topics(*), author:profiles(*)")
    .eq("topic_id", topic.id)
    .eq("status", "approved")

  if (searchQuery) {
    query = query.ilike("question_text", `%${searchQuery}%`)
  }

  const { data: questions } = await query.order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title={topic.name} showBack />

      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        {/* Search Bar */}
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            name="search"
            placeholder="Search questions..."
            defaultValue={searchQuery}
            className="pl-10 h-12"
          />
        </form>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/topics/${params.slug}?filter=all`}>All</a>
          </Button>
          <Button variant={filter === "answered" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/topics/${params.slug}?filter=answered`}>Answered</a>
          </Button>
          <Button variant={filter === "unanswered" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/topics/${params.slug}?filter=unanswered`}>Unanswered</a>
          </Button>
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {!questions || questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No questions found</div>
          ) : (
            questions.map((question) => <QuestionCardItem key={question.id} question={question} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
