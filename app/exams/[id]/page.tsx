import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Clock, BookOpen, AlertCircle, Bookmark } from "lucide-react"
import Link from "next/link"
import { RateExamForm } from "./rate-exam-form"
import { saveExam, unsaveExam } from "@/lib/db-actions"
import { ShareButton } from "@/components/share-button"

export default async function ExamDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch exam details with creator info
  const { data: exam } = await supabase
    .from("community_exams")
    .select(`
      *,
      creator:users!created_by(id, full_name, email, avatar_url),
      topics:community_exam_topics(topic:topics(*))
    `)
    .eq("id", params.id)
    .single()

  if (!exam) {
    notFound()
  }

  // Check if user has saved this exam
  let isSaved = false
  if (user) {
    const { data: savedExam } = await supabase
      .from("saved_exams")
      .select("id")
      .eq("user_id", user.id)
      .eq("exam_id", exam.id)
      .single()

    isSaved = !!savedExam
  }

  // Check if user has taken this exam
  const { data: userAttempt } = user
    ? await supabase
        .from("community_exam_attempts")
        .select("*")
        .eq("exam_id", exam.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  // Fetch ratings
  const { data: ratings } = await supabase
    .from("exam_ratings")
    .select("*, user:profiles(full_name, email)")
    .eq("exam_id", exam.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
    mixed: "bg-blue-100 text-blue-800",
  }

  async function toggleSaveExam() {
    "use server"
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: existing } = await supabase
      .from("saved_exams")
      .select("id")
      .eq("user_id", user.id)
      .eq("exam_id", params.id)
      .single()

    if (existing) {
      await unsaveExam(user.id, params.id)
    } else {
      await saveExam(user.id, params.id)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Exam Details" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Exam Info Card */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-balance">{exam.title}</h1>
            {exam.description && <p className="text-muted-foreground leading-relaxed">{exam.description}</p>}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-lg">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{exam.rating_average?.toFixed(1) || "0.0"}</span>
              <span className="text-muted-foreground text-sm">({exam.rating_count || 0} ratings)</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{exam.taken_count || 0} attempts</span>
            </div>

            {exam.time_limit && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{exam.time_limit} minutes</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {exam.question_count} questions
            </Badge>
            <Badge className={difficultyColors[exam.difficulty as keyof typeof difficultyColors]}>
              {exam.difficulty}
            </Badge>
            {exam.is_featured && <Badge className="bg-primary">Featured</Badge>}
          </div>

          {exam.creator && (
            <div className="text-sm text-muted-foreground pt-2 border-t">
              Created by {exam.creator.full_name || exam.creator.email}
            </div>
          )}

          {/* Action Buttons */}
          {user && (
            <div className="flex gap-2 pt-2 border-t">
              <form action={toggleSaveExam} className="flex-1">
                <Button type="submit" variant="outline" size="sm" className="w-full bg-transparent">
                  <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
              </form>
              <ShareButton
                title={exam.title}
                text="Check out this community exam"
                url={`/exams/${exam.id}`}
                variant="outline"
                size="sm"
              />
            </div>
          )}
        </Card>

        {/* Topics Covered */}
        {exam.topics && exam.topics.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Topics Covered</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {exam.topics.map((t: any) => (
                <Badge key={t.topic.id} variant="outline">
                  {t.topic.code} - {t.topic.name}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Previous Attempt */}
        {userAttempt && (
          <Card className="p-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Previous Attempt</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Score: {userAttempt.score !== null ? `${userAttempt.score}%` : "Not completed"}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {new Date(userAttempt.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {user ? (
            <>
              <Link href={`/exams/${exam.id}/take`} className="block">
                <Button size="lg" className="w-full">
                  {userAttempt ? "Retake Exam" : "Start Exam"}
                </Button>
              </Link>
              {userAttempt && <RateExamForm examId={exam.id} userId={user.id} />}
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="lg" className="w-full">
                Login to Take Exam
              </Button>
            </Link>
          )}
        </div>

        {/* Recent Ratings */}
        {ratings && ratings.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {ratings.map((rating: any) => (
                <div key={rating.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{rating.user?.full_name || rating.user?.email}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{rating.rating}</span>
                    </div>
                  </div>
                  {rating.review && <p className="text-sm text-muted-foreground">{rating.review}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
