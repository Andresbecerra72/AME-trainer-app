import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ExamTakeClient } from "./exam-take-client"

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch exam
  const { data: exam } = await supabase
    .from("community_exams")
    .select("*")
    .eq("id", id)
    .single()

  if (!exam) {
    notFound()
  }

  // Get topic IDs from the exam's topic_ids array
  const topicIds = exam.topic_ids || []

  let query = supabase
    .from("questions")
    .select(`
      *,
      topic:topics(id, name, code)
    `)
    .eq("status", "approved")
    .in("topic_id", topicIds)

  // Apply difficulty filter if not mixed
  if (exam.difficulty !== "mixed") {
    query = query.eq("difficulty", exam.difficulty)
  }

  query = query.limit(exam.question_count)

  const { data: questions } = await query

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Questions Available</h1>
          <p className="text-muted-foreground">This exam doesn't have enough approved questions yet.</p>
        </div>
      </div>
    )
  }

  // Shuffle questions
  const shuffledQuestions = questions.sort(() => Math.random() - 0.5)

  return <ExamTakeClient exam={exam} questions={shuffledQuestions} userId={user.id} />
}
