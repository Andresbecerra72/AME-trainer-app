import { getCurrentUser } from "@/features/auth/services/auth.server"
import { supabaseBrowserClient } from "@/lib/supabase/client"
import { EmptyState } from "@/components/empty-state"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, Plus } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

interface CommunityContentProps {
  search?: string
  topic?: string
  difficulty?: string
  sort?: string
}

export async function CommunityContent({
  search = "",
  topic = "all",
  difficulty = "all",
  sort = "recent",
}: CommunityContentProps) {
  const {
    data: { user },
  } = await getCurrentUser()
  let userRole: "user" | "admin" | "super_admin" = "user"

  if (user) {
    const { data: profile } = await supabaseBrowserClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()
    userRole = profile?.role || "user"
  }

  // Fetch questions with filters
  let query = supabaseBrowserClient
    .from("questions")
    .select(
      `
      *,
      author:users(id, full_name, avatar_url),
      topic:topics(id, name, code)
    `
    )
    .eq("status", "approved")

  if (sort === "popular") {
    query = query.order("views_count", { ascending: false })
  } else if (sort === "discussed") {
    query = query.order("comments_count", { ascending: false })
  } else if (sort === "unanswered") {
    query = query.order("answers_count", { ascending: true })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  if (search) {
    query = query.ilike("question_text", `%${search}%`)
  }

  if (topic && topic !== "all") {
    query = query.eq("topic_id", topic)
  }

  if (difficulty && difficulty !== "all") {
    query = query.eq("difficulty", difficulty)
  }

  const { data: questions } = await query

  return (
    <div className="p-4 space-y-4">
      {/* Questions List */}
      <div className="space-y-3">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <Link key={question.id} href={`/community/questions/${question.id}`}>
              <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="space-y-3">
                  <h3 className="font-medium text-balance leading-relaxed line-clamp-2">
                    {question.question_text}
                  </h3>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{question.comments_count || 0}</span>
                    </div>
                    {question.topic && (
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {question.topic.code}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {question.author?.full_name || "Anonymous"}</span>
                    <span>{new Date(question.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="No questions found"
            description="Be the first to contribute and help the community!"
            actionLabel="Submit a Question"
            actionHref="/community/add-question"
          />
        )}
      </div>
    </div>
  )
}
