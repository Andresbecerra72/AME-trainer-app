import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ExamSetupClient } from "./exam-setup-client"

interface Topic {
  id: string
  name: string
  question_count: number
}

export default async function ExamSetupPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, question_count")
    .order("name")

  const plainTopics: Topic[] = (topics || []).map((topic) => ({
    id: topic.id,
    name: topic.name,
    question_count: topic.question_count,
  }))

  return <ExamSetupClient topics={plainTopics} />
}
