import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategorySection } from "./CategorySection"
import { EmptyState } from "@/components/empty-state"
import { MessageCircle } from "lucide-react"

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation?: string | null
  difficulty: "easy" | "medium" | "hard"
  comments_count?: number
  views_count?: number
  upvotes?: number
  downvotes?: number
  created_at: string
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
  topic?: {
    id: string
    name: string
    code: string
  } | null
}

interface CommunityTabbedViewProps {
  questions: Question[]
}

const categoryNames: Record<string, string> = {
  SPM: "Standard Practices & Maintenance",
  AF: "Airframe",
  PP: "Powerplant",
  TG: "Turbine Gas",
  EG: "Electrical General",
  EAV: "Avionics",
}

export function CommunityTabbedView({ questions }: CommunityTabbedViewProps) {
  // Group questions by rating and category
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!question.topic?.code) return acc

    const parts = question.topic.code.split("-")
    if (parts.length < 2) return acc

    const rating = parts[0] // M, T, E
    const category = parts[1] // SPM, AF, PP, etc.

    if (!acc[rating]) acc[rating] = {}
    if (!acc[rating][category]) acc[rating][category] = []
    acc[rating][category].push(question)

    return acc
  }, {} as Record<string, Record<string, Question[]>>)

  const ratings = ["M", "T", "E"]
  const hasQuestions = Object.keys(groupedQuestions).length > 0

  if (!hasQuestions) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No questions found"
        description="Be the first to contribute and help the community!"
        actionLabel="Submit a Question"
        actionHref="/protected/community/add-question"
      />
    )
  }

  return (
    <Tabs defaultValue="M" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        {ratings.map((rating) => {
          const count = Object.values(groupedQuestions[rating] || {}).reduce(
            (sum, qs) => sum + qs.length,
            0
          )
          return (
            <TabsTrigger
              key={rating}
              value={rating}
              className="text-sm sm:text-base"
              disabled={!groupedQuestions[rating]}
            >
              <span className="font-bold">{rating} Rating</span>
              {count > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {ratings.map((rating) => {
        const categories = groupedQuestions[rating] || {}
        const hasCategories = Object.keys(categories).length > 0

        return (
          <TabsContent key={rating} value={rating} className="space-y-3 sm:space-y-4">
            {hasCategories ? (
              Object.entries(categories)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([categoryCode, categoryQuestions]) => (
                  <CategorySection
                    key={categoryCode}
                    categoryName={categoryNames[categoryCode] || categoryCode}
                    categoryCode={categoryCode}
                    questions={categoryQuestions}
                  />
                ))
            ) : (
              <EmptyState
                icon={MessageCircle}
                title={`No ${rating} Rating questions yet`}
                description="Be the first to add a question for this rating!"
                actionLabel="Submit a Question"
                actionHref="/protected/community/add-question"
              />
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
