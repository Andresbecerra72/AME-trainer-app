import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { 
  getAllQuestionsForAdmin,
  updateQuestionStatusAction 
} from "@/features/questions/services/question.server"
import { getSession } from "@/features/auth/services/getSession"
import { Search, CheckCircle, XCircle, AlertCircle, Info, User, Calendar, BookOpen } from "lucide-react"
import { revalidatePath } from "next/cache"
import { getAllTopicsServer } from "@/features/topics/services/topic.server"
import { EditButtonClient } from "@/features/questions/components/edit-button-client"
import { DeleteButtonClient } from "@/features/questions/components/delete-button-client"


async function updateStatus(formData: FormData) {
  "use server"
  const questionId = formData.get("questionId") as string
  const status = formData.get("status") as "approved" | "rejected" | "pending"
  await updateQuestionStatusAction(questionId, status)
  revalidatePath("/admin/questions")
}

type PageProps = {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function AdminQuestionsPage({ searchParams }: PageProps) {
  const { user, role } = await getSession()
  const { search = "", status = "" } = await searchParams
      
  if (!user) {
    redirect("/auth/login")
  }

  if (!role || !["admin", "super_admin"].includes(role)) {
    redirect("/dashboard")
  }

  const [questions, topics] = await Promise.all([
    getAllQuestionsForAdmin({
      searchQuery: search,
      status: status || undefined,
    }),
    getAllTopicsServer(),
  ])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { 
          label: "Approved", 
          className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
        }
      case "rejected":
        return { 
          label: "Rejected", 
          className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
        }
      case "pending":
        return { 
          label: "Pending", 
          className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
        }
      default:
        return { 
          label: "Unknown", 
          className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
        }
    }
  }

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return { label: "Easy", className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" }
      case "medium":
        return { label: "Medium", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" }
      case "hard":
        return { label: "Hard", className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" }
      default:
        return { label: "Unknown", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20" }
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 scroll-smooth">
      <MobileHeader title="Manage Questions" showBack />

      <div id="top" className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <form className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search questions..."
              defaultValue={search}
              className="pl-10 h-12"
            />
          </form>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant={status === "" ? "default" : "outline"} 
              size="sm" 
              asChild
            >
              <a href="/admin/questions">All</a>
            </Button>
            <Button 
              variant={status === "approved" ? "default" : "outline"} 
              size="sm" 
              asChild
            >
              <a href="/admin/questions?status=approved">Approved</a>
            </Button>
            <Button 
              variant={status === "pending" ? "default" : "outline"} 
              size="sm" 
              asChild
            >
              <a href="/admin/questions?status=pending">Pending</a>
            </Button>
            <Button 
              variant={status === "rejected" ? "default" : "outline"} 
              size="sm" 
              asChild
            >
              <a href="/admin/questions?status=rejected">Rejected</a>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{questions.length}</span> question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No questions found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question: any, index: number) => {
              const statusConfig = getStatusConfig(question.status)
              const difficultyConfig = getDifficultyConfig(question.difficulty)
              const correctAnswerText = question[`option_${question.correct_answer.toLowerCase()}`]

              return (
                <Card 
                  key={question.id} 
                  id={`question-${index}`}
                  className="overflow-hidden shadow-sm hover:shadow-md transition-all scroll-mt-20"
                >
                  <CardContent className="p-0">
                    {/* Compact Header */}
                    <div className="bg-gradient-to-r from-primary/5 to-transparent px-3 py-2 border-b">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Left: Author + Date */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                            <span className="truncate font-medium text-foreground">
                              {question.author?.full_name || question.author?.username || "Anonymous"}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline whitespace-nowrap">
                              {new Date(question.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Right: Badges */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge className={`${statusConfig.className} border text-[10px] px-1.5 py-0 h-5`}>
                            {statusConfig.label}
                          </Badge>
                          {question.topic && (
                            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-5">
                              {question.topic.code}
                            </Badge>
                          )}
                          <Badge className={`${difficultyConfig.className} border text-[10px] px-1.5 py-0 h-5`}>
                            {difficultyConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-3">
                      {/* Question */}
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                        {question.question_text}
                      </h3>

                      {/* Correct Answer Only */}
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-500 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {question.correct_answer}
                          </div>
                          <p className="text-sm leading-relaxed flex-1">{correctAnswerText}</p>
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        </div>
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            <span>View explanation</span>
                          </summary>
                          <div className="mt-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-2.5">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-2 bg-muted/30 border-t">
                      <div className="flex gap-1.5">
                        <EditButtonClient 
                          question={{
                            id: question.id,
                            question_text: question.question_text,
                            option_a: question.option_a,
                            option_b: question.option_b,
                            option_c: question.option_c,
                            option_d: question.option_d,
                            correct_answer: question.correct_answer,
                            topic_id: question.topic_id,
                            difficulty: question.difficulty,
                            explanation: question.explanation,
                          }}
                          topics={topics}
                        />

                        {question.status !== "approved" && (
                          <form action={updateStatus} className="flex-1">
                            <input type="hidden" name="questionId" value={question.id} />
                            <input type="hidden" name="status" value="approved" />
                            <Button 
                              type="submit" 
                              size="sm" 
                              className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </form>
                        )}

                        {question.status !== "rejected" && (
                          <form action={updateStatus} className="flex-1">
                            <input type="hidden" name="questionId" value={question.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <Button 
                              type="submit" 
                              size="sm" 
                              variant="destructive"
                              className="w-full h-8 text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </form>
                        )}

                        <DeleteButtonClient questionId={question.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Scroll indicators - show every 10 items */}
        {questions.length > 10 && (
          <div className="sticky bottom-20 sm:bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10">
            <div className="pointer-events-auto">
              <a 
                href="#top"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <span className="text-sm font-medium">Back to Top</span>
              </a>
            </div>
          </div>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
