import { createClient } from "@/lib/supabase/server"
import { getCommunityExams } from "@/lib/db-actions"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Plus, Star, Users, Clock, TrendingUp, BookOpen } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

export default async function CommunityExamsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const exams = await getCommunityExams({ limit: 50 })
  const featuredExams = exams.filter((e) => e.is_featured).slice(0, 3)
  const regularExams = exams.filter((e) => !e.is_featured)

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Community Exams" showBack />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Exam Button */}
        {user && (
          <Link href="/exams/create">
            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Community Exam
            </Button>
          </Link>
        )}

        {/* Search */}
        <div className="relative">
          <Input placeholder="Search exams..." className="pl-10" />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Featured Exams */}
        {featuredExams.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Featured Exams</h2>
            </div>
            <div className="space-y-3">
              {featuredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} featured />
              ))}
            </div>
          </section>
        )}

        {/* All Exams */}
        {regularExams.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">All Community Exams</h2>
            <div className="space-y-3">
              {regularExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </section>
        )}

        {exams.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No community exams yet"
            description="Community exams allow you to practice with curated question sets created by other users."
            actionLabel={user ? "Create the First Exam" : "Sign In to Create"}
            actionHref={user ? "/exams/create" : "/auth/login"}
          />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function ExamCard({ exam, featured = false }: { exam: any; featured?: boolean }) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
    mixed: "bg-blue-100 text-blue-800",
  }

  return (
    <Link href={`/exams/${exam.id}`}>
      <Card className={`p-4 hover:shadow-md transition-shadow ${featured ? "border-primary border-2" : ""}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-balance">{exam.title}</h3>
              {exam.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
              )}
            </div>
            {featured && <Badge className="shrink-0">Featured</Badge>}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{exam.rating_average.toFixed(1)}</span>
              <span>({exam.rating_count})</span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{exam.taken_count} taken</span>
            </div>

            {exam.time_limit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{exam.time_limit} min</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{exam.question_count} questions</Badge>
            <Badge className={difficultyColors[exam.difficulty as keyof typeof difficultyColors]}>
              {exam.difficulty}
            </Badge>
          </div>

          {exam.creator && (
            <div className="text-xs text-muted-foreground">
              Created by {exam.creator.display_name || exam.creator.email}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
