import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ExamSetupClient } from "./exam-setup-client"
import { type TopicWithCount } from "@/features/exams/exam-setup.logic"

export default async function ExamSetupPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Obtener todos los topics con su código para agrupar por rating y categoría
  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, code, question_count")
    .order("code")

  const plainTopics: TopicWithCount[] = (topics || []).map((topic) => ({
    id: topic.id,
    name: topic.name,
    code: topic.code,
    question_count: topic.question_count,
  }))

  return <ExamSetupClient topics={plainTopics} />
}
