import { createSupabaseServerClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"

export default async function AddQuestionPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  // Fetch user profile for BottomNav
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  // Fetch topics
  const { data: topics } = await supabase.from("topics").select("*").order("name")

  async function handleSubmit(formData: FormData) {
    "use server"
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("questions").insert({
      question_text: formData.get("question_text") as string,
      option_a: formData.get("option_a") as string,
      option_b: formData.get("option_b") as string,
      option_c: formData.get("option_c") as string,
      option_d: formData.get("option_d") as string,
      correct_answer: formData.get("correct_answer") as string,
      explanation: formData.get("explanation") as string,
      topic_id: formData.get("topic_id") as string,
      difficulty: formData.get("difficulty") as string,
      author_id: user.id,
      status: "pending",
    })

    redirect("/protected/community")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Submit Question" showBack />

      <div className="p-4">
        <form action={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question_text">Question *</Label>
            <Textarea
              id="question_text"
              name="question_text"
              placeholder="Enter your question..."
              required
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Answer Options *</Label>
            {["A", "B", "C", "D"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <span className="font-semibold w-6">{option}.</span>
                <Input
                  name={`option_${option.toLowerCase()}`}
                  placeholder={`Option ${option}`}
                  required
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correct_answer">Correct Answer *</Label>
            <Select name="correct_answer" required>
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Option A</SelectItem>
                <SelectItem value="B">Option B</SelectItem>
                <SelectItem value="C">Option C</SelectItem>
                <SelectItem value="D">Option D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (Optional)</Label>
            <Textarea
              id="explanation"
              name="explanation"
              placeholder="Explain why this is the correct answer..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic_id">Topic *</Label>
            <Select name="topic_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {topics?.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty *</Label>
            <Select name="difficulty" required>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Submit Question for Review
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your question will be reviewed by moderators before being published to the community.
          </p>
        </form>
      </div>

      <BottomNav userRole={profile?.role} />
    </div>
  )
}
