import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuestionCardItem } from "@/components/question-card-item"
import { BottomNav } from "@/components/bottom-nav"
import { getTopicById } from "@/features/topics/services/topic.server"
import { getTopicQuestions } from "@/features/questions/services/question.server"
import { MobileHeaderBack } from "@/components/mobile-header-back"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; filter?: string }>
}

export default async function TopicQuestionsPage({ params, searchParams }: PageProps) {
  // Extract and validate URL parameters
  const [{ id }, { search = "", filter = "all" }] = await Promise.all([
    params,
    searchParams,
  ])

  // Get topic by id
  const topic = await getTopicById(id)

  if (!topic) {
    return <div>Topic not found</div>
  }

  // Get questions for the topic
  const questions = await getTopicQuestions(id, {
    searchQuery: search,
    filter,
  })

  return (
    <div className="min-h-screen bg-background pb-20">
           <MobileHeaderBack title={topic.name}  backUrl="/protected/topics" />

      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        {/* Search Bar */}
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            name="search"
            placeholder="Search questions..."
            defaultValue={search}
            className="pl-10 h-12"
          />
        </form>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/protected/topics/${id}?filter=all`}>All</a>
          </Button>
          <Button variant={filter === "answered" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/protected/topics/${id}?filter=answered`}>Answered</a>
          </Button>
          <Button variant={filter === "unanswered" ? "default" : "outline"} size="sm" asChild className="flex-1">
            <a href={`/protected/topics/${id}?filter=unanswered`}>Unanswered</a>
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
