import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
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
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react"
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "pending":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Manage Questions" showBack />

      <div className="p-4 space-y-4">
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
          <MobileCard className="text-center py-8">
            <p className="text-muted-foreground">No questions found</p>
          </MobileCard>
        ) : (
          <div className="space-y-3">
            {questions.map((question: any) => (
              <MobileCard key={question.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/community/questions/${question.id}`}
                        className="font-medium hover:underline line-clamp-2 block"
                      >
                        {question.question_text}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>by {question.author?.full_name || question.author?.username || "Anonymous"}</span>
                        {question.topic && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {question.topic.name}
                            </Badge>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(question.status)}
                    >
                      {question.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
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
                      <form action={updateStatus} className="flex-1 min-w-[100px]">
                        <input type="hidden" name="questionId" value={question.id} />
                        <input type="hidden" name="status" value="approved" />
                        <Button 
                          type="submit" 
                          size="sm" 
                          variant="outline" 
                          className="w-full bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </form>
                    )}

                    {question.status !== "rejected" && (
                      <form action={updateStatus} className="flex-1 min-w-[100px]">
                        <input type="hidden" name="questionId" value={question.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <Button 
                          type="submit" 
                          size="sm" 
                          variant="outline" 
                          className="w-full bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </form>
                    )}

                    <DeleteButtonClient questionId={question.id} />
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
