import { EmptyState } from "@/components/empty-state"
import { MessageCircle } from "lucide-react"
import { getCommunityQuestions } from "@/features/community/services/community.server"
import { CommunityQuestionCard } from "./CommunityQuestionCard"
import { CommunityTabbedView } from "./CommunityTabbedView"

interface CommunityContentProps {
  search?: string
  topic?: string
  difficulty?: string
  sort?: string
}

export async function CommunityContent({
  search = "",
  topic = "all",
  difficulty = "all",
  sort = "recent",
}: CommunityContentProps) {
  
  // Fetch questions via server action
  const questions = await getCommunityQuestions({
    search,
    topic,
    difficulty,
    sort,
  })

  // Check if user is actively filtering
  const hasActiveFilters = search !== "" || topic !== "all" || difficulty !== "all" || sort !== "recent"

  return (
    <div className="space-y-4">
      {questions && questions.length > 0 ? (
        hasActiveFilters ? (
          // Show flat list when filters are active
          <div className="space-y-3">
            {questions.map((question) => (
              <CommunityQuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          // Show organized tabbed view when no filters
          <CommunityTabbedView questions={questions} />
        )
      ) : (
        <EmptyState
          icon={MessageCircle}
          title="No questions found"
          description="Try adjusting your filters or be the first to contribute!"
          actionLabel="Submit a Question"
          actionHref="/protected/community/add-question"
        />
      )}
    </div>
  )
}
