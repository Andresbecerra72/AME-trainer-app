import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, Star, BookmarkX } from "lucide-react"
import Link from "next/link"
import { getSavedExams, unsaveExam } from "@/lib/db-actions"
import { BottomNav } from "@/components/bottom-nav"

export default async function SavedExamsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const savedExams = await getSavedExams(user.id)
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  async function removeSaved(formData: FormData) {
    "use server"
    const examId = formData.get("examId") as string
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await unsaveExam(user.id, examId)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Saved Exams" showBack />

      <div className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground">
          {savedExams.length} saved exam{savedExams.length !== 1 ? "s" : ""}
        </div>

        {savedExams.length > 0 ? (
          <div className="space-y-3">
            {savedExams.map((saved) => {
              const exam = saved.exam
              return (
                <MobileCard key={saved.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/exams/${exam.id}`}>
                          <h3 className="font-semibold text-balance leading-snug hover:underline">{exam.title}</h3>
                        </Link>
                        {exam.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize flex-shrink-0">
                        {exam.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={exam.creator?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{exam.creator?.full_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <span>{exam.creator?.full_name || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{exam.time_limit ? `${exam.time_limit}min` : "No limit"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{exam.taken_count || 0}</span>
                      </div>
                      {exam.rating_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{exam.rating_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/exams/${exam.id}/take`}>Start Exam</Link>
                      </Button>
                      <form action={removeSaved}>
                        <input type="hidden" name="examId" value={exam.id} />
                        <Button type="submit" variant="outline" size="sm">
                          <BookmarkX className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </MobileCard>
              )
            })}
          </div>
        ) : (
          <MobileCard className="text-center py-12">
            <BookmarkX className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No saved exams yet</p>
            <Button asChild size="sm">
              <Link href="/exams">Browse Exams</Link>
            </Button>
          </MobileCard>
        )}
      </div>

      <BottomNav userRole={profile?.role} />
    </div>
  )
}
