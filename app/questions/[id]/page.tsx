import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { AnswerButton } from "@/components/answer-button"
import { SecondaryButton } from "@/components/secondary-button"
import { Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import Link from "next/link"

export default async function ViewQuestionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: question, error } = await supabase
    .from("questions")
    .select(`
      *,
      topic:topics(*),
      author:profiles(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !question) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Question Details" showBack />
        <div className="p-6 text-center text-muted-foreground">Question not found</div>
      </div>
    )
  }

  // Check if current user is the author
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthor = user?.id === question.author_id

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Question Details" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto pb-24">
        {/* Topic Badge */}
        {question.topic && (
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {question.topic.name}
          </div>
        )}

        {/* Question */}
        <MobileCard>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Question</h2>
          <p className="text-base leading-relaxed text-foreground">{question.question_text}</p>
        </MobileCard>

        {/* Options */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Options</h2>
          <AnswerButton letter="A" text={question.option_a} correct={question.correct_answer === "A"} disabled />
          <AnswerButton letter="B" text={question.option_b} correct={question.correct_answer === "B"} disabled />
          <AnswerButton letter="C" text={question.option_c} correct={question.correct_answer === "C"} disabled />
          <AnswerButton letter="D" text={question.option_d} correct={question.correct_answer === "D"} disabled />
        </div>

        {/* Correct Answer Indicator */}
        <MobileCard className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-semibold">
              {question.correct_answer}
            </div>
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">Correct Answer</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {question[`option_${question.correct_answer.toLowerCase()}`]}
              </p>
            </div>
          </div>
        </MobileCard>

        {/* Explanation */}
        {question.explanation && (
          <MobileCard className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Explanation</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{question.explanation}</p>
          </MobileCard>
        )}

        {/* Action Buttons - only for question author */}
        {isAuthor && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
            <div className="max-w-2xl mx-auto flex gap-3">
              <Link href={`/questions/${question.id}/edit`} className="flex-1">
                <SecondaryButton className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </SecondaryButton>
              </Link>
              <SecondaryButton className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </SecondaryButton>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
