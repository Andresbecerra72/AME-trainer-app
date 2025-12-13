import { MobileHeader } from "@/components/mobile-header"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuestionCardItem } from "@/components/question-card-item"
import { BottomNav } from "@/components/bottom-nav"
import { supabaseBrowserClient } from "@/lib/supabase/client"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function TopicQuestionsPage({
  params,
  searchParams,
}: { params: { id: string }; searchParams: { search?: string; filter?: string } }) {
  const { id } = await params
  const { search, filter } = await searchParams
  
  const supabase = await createSupabaseServerClient()
  const searchQuery = search || ""
  const filterQuery = filter || "all"

  // Get topic by id
  const { data: topic } = await supabase.from("topics").select("*").eq("id", id).single()

  console.log("Fetched topic:", topic)

  if (!topic) {
    return <div>Topic not found</div>
  }

  // Build query
  let query = supabase
    .from("questions")
    .select(`*,
       topic:topics!questions_topic_id_fkey(*), 
       author:profiles!questions_author_id_fkey(*)`)
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
          <Button variant={filterQuery === "all" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/topics/${id}?filter=all`}>All</a>
          </Button>
          <Button variant={filterQuery === "answered" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/topics/${id}?filter=answered`}>Answered</a>
          </Button>
          <Button variant={filterQuery === "unanswered" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/topics/${id}?filter=unanswered`}>Unanswered</a>
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
