import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { redirect, notFound } from "next/navigation"
import { getTopics } from "@/lib/db-actions"
import { QuestionForm } from "@/features/community/components/QuestionForm"
import { checkEditPermissions } from "@/features/community/services/edit-permissions"

interface EditQuestionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = await params

  // Check permissions and get question data
  const permissionsData = await checkEditPermissions(id)
  
  if (!permissionsData) {
    notFound()
  }

  const { canEdit, question } = permissionsData

  if (!canEdit) {
    redirect("/protected/community")
  }

  // Fetch topics for the form
  const topics = await getTopics()

  // Prepare initial data for the form
  const initialData = {
    id: question.id,
    question_text: question.question_text,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_answer: question.correct_answer as "A" | "B" | "C" | "D",
    explanation: question.explanation || "",
    topic_id: question.topic_id,
    difficulty: question.difficulty as "easy" | "medium" | "hard",
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Edit Question" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <QuestionForm topics={topics} initialData={initialData} mode="edit" />
      </main>

      <BottomNav />
    </div>
  )
}
