import { createSupabaseServerClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { redirect, notFound } from "next/navigation"
import { getTopics } from "@/lib/db-actions"
import { QuestionForm } from "@/features/community/components/QuestionForm"
import { getCommunityQuestion } from "@/features/community/community.api"

interface EditQuestionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch question
  const question = await getCommunityQuestion(id)
  
  if (!question) {
    notFound()
  }

  // Check permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAuthor = question.author_id === user.id
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"

  if (!isAuthor && !isAdmin) {
    redirect("/protected/community")
  }

  const topics = await getTopics()

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
    //   difficulty: formData.get("difficulty") as string,
    // }

    // const originalData = {
    //   question_text: question.question_text,
    //   option_a: question.option_a,
    //   option_b: question.option_b,
    //   option_c: question.option_c,
    //   option_d: question.option_d,
    //   correct_answer: question.correct_answer,
    //   explanation: question.explanation,
    //   topic_id: question.topic_id,
    //   difficulty: question.difficulty,
    // }

    const reason = formData.get("reason") as string

    await createEditSuggestion(
      id,
      proposed_question_text,
      proposed_answers,
      proposed_correct_index,
      reason,
    )

    redirect(`/protected/community/questions/${id}`)
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <MobileHeader title="Suggest Edit" showBack />

      <div className="p-4">
        <MobileCard>
          <form action={submitEditSuggestion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Edit</Label>
              <Textarea id="reason" name="reason" placeholder="Explain why this edit is needed..." rows={3} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text</Label>
              <Textarea
                id="question_text"
                name="question_text"
                defaultValue={question.question_text}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="option_a">Option A</Label>
                <Input id="option_a" name="option_a" defaultValue={question.option_a} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option_b">Option B</Label>
                <Input id="option_b" name="option_b" defaultValue={question.option_b} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option_c">Option C</Label>
                <Input id="option_c" name="option_c" defaultValue={question.option_c} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option_d">Option D</Label>
                <Input id="option_d" name="option_d" defaultValue={question.option_d} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correct_answer">Correct Answer</Label>
              <Select name="correct_answer" defaultValue={question.correct_answer} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea id="explanation" name="explanation" defaultValue={question.explanation || ""} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic_id">Topic</Label>
                <Select name="topic_id" defaultValue={question.topic_id} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select name="difficulty" defaultValue={question.difficulty} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Submit Suggestion
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                <a href={`/protected/community/questions/${id}`}>Cancel</a>
              </Button>
            </div>
          </form>
        </MobileCard>
      </div>
    </div>
  )
}
