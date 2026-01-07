import { EmptyState } from "@/components/empty-state"
import { MessageCircle } from "lucide-react"
import { getCommunityQuestions } from "@/features/community/services/community.server"
import { CommunityQuestionCard } from "./CommunityQuestionCard"

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

  return (
    <div className="p-4 space-y-4">
      {/* Questions List */}
      <div className="space-y-3">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <CommunityQuestionCard key={question.id} question={question} />
          ))
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="No questions found"
            description="Be the first to contribute and help the community!"
            actionLabel="Submit a Question"
            actionHref="/protected/community/add-question"
          />
        )}
      </div>
    </div>
  )
}
