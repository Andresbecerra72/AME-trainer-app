import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ExamTakeClient } from "./exam-take-client"

export default async function TakeExamPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch exam with topics
  const { data: exam } = await supabase
    .from("community_exams")
    .select(`
      *,
      topics:community_exam_topics(topic_id)
    `)
    .eq("id", params.id)
    .single()

  if (!exam) {
    notFound()
  }

  // Fetch questions based on exam configuration
  const topicIds = exam.topics.map((t: any) => t.topic_id)

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
