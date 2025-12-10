import { redirect } from "next/navigation"
import { fetchExamData } from "@/features/exams/services/exams.api"
import ExamRunClient from "../../../features/exams/components/ExamRunClient"

export default async function ExamRunPage({
  searchParams,
}: {
  searchParams: { topics?: string; count?: string; timer?: string }
}) {
  const { topics, count, timer } =  await searchParams

  const topicIds = topics?.split(",") || []
  const questionCount = Number.parseInt(count || "20")
  const timerEnabled = timer === "true"

  if (topicIds.length === 0) {
    redirect("/exam/setup")
  }

  const { user, questions } = await fetchExamData({ topicIds, questionCount })

  if (!user) {
    redirect("/auth/login")
  }

  if (!questions || questions.length === 0) {
    redirect("/exam/setup")
  }

  return <ExamRunClient questions={questions} timerEnabled={timerEnabled} questionCount={questionCount} />
}
