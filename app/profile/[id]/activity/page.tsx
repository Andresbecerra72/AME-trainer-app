import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { supabaseBrowserClient } from "@/lib/supabase/client"
import { MobileHeader } from "@/components/mobile-header"
import { EmptyState } from "@/components/empty-state"
import { Activity, Edit3, MessageCircle, MessageSquare, ThumbsUp } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default async function UserActivityPage({ params }: { params: { id: string } }) {
  const supabase = supabaseBrowserClient

   const { id } = await params

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!profile) notFound()

  // Fetch all user activities
  const [questions, comments, votes, editSuggestions] = await Promise.all([
    supabase
      .from("questions")
      .select(`*, topics(name, code)`)
      .eq("author_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select(`*, questions(question_text)`)
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("votes")
      .select(`*, questions(question_text)`)
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("edit_suggestions")
      .select(`*, questions(question_text)`)
      .eq("suggested_by", id)
      .order("created_at", { ascending: false }),
  ])

  // Combine and sort all activities by date
  const activities = [
    ...(questions.data || []).map((q) => ({ ...q, type: "question", date: q.created_at })),
    ...(comments.data || []).map((c) => ({ ...c, type: "comment", date: c.created_at })),
    ...(votes.data || []).map((v) => ({ ...v, type: "vote", date: v.created_at })),
    ...(editSuggestions.data || []).map((e) => ({ ...e, type: "edit", date: e.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Activity Timeline" showBack />

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
          <h2 className="font-bold text-lg mb-1">{profile.username}'s Activity</h2>
          <p className="text-sm text-muted-foreground">{activities.length} total contributions</p>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="This user hasn't contributed to the community yet."
            />
          ) : (
            activities.map((activity, index) => (
              <div key={`${activity.type}-${activity.id || index}`} className="relative pl-8">
                {/* Timeline line */}
                {index < activities.length - 1 && <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />}

                {/* Timeline dot */}
                <div className="absolute left-0 top-2 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  {activity.type === "question" && <MessageSquare className="h-3 w-3 text-primary" />}
                  {activity.type === "comment" && <MessageCircle className="h-3 w-3 text-primary" />}
                  {activity.type === "vote" && <ThumbsUp className="h-3 w-3 text-primary" />}
                  {activity.type === "edit" && <Edit3 className="h-3 w-3 text-primary" />}
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {activity.type === "question" && <Badge className="bg-primary/10 text-primary">Question</Badge>}
                      {activity.type === "comment" && <Badge className="bg-blue-500/10 text-blue-500">Comment</Badge>}
                      {activity.type === "vote" && (
                        <Badge className="bg-green-500/10 text-green-500">
                          {activity.vote_type === "up" ? "Upvoted" : "Downvoted"}
                        </Badge>
                      )}
                      {activity.type === "edit" && (
                        <Badge className="bg-orange-500/10 text-orange-500">Edit Suggestion</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </span>
                  </div>

                  {activity.type === "question" && (
                    <Link href={`/community/questions/${activity.id}`}>
                      <p className="text-sm font-medium hover:text-primary line-clamp-2">{activity.question_text}</p>
                      {activity.topics && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {activity.topics.code}
                        </Badge>
                      )}
                    </Link>
                  )}

                  {activity.type === "comment" && (
                    <div>
                      <p className="text-sm mb-2 line-clamp-2">{activity.content}</p>
                      <p className="text-xs text-muted-foreground">on: {activity.questions?.question_text}</p>
                    </div>
                  )}

                  {activity.type === "vote" && (
                    <p className="text-sm text-muted-foreground">Voted on: {activity.questions?.question_text}</p>
                  )}

                  {activity.type === "edit" && (
                    <div>
                      <p className="text-sm mb-2">Suggested edit for question</p>
                      <Badge
                        variant="outline"
                        className={
                          activity.status === "approved"
                            ? "bg-green-500/10 text-green-500"
                            : activity.status === "rejected"
                              ? "bg-red-500/10 text-red-500"
                              : ""
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav userRole={profile.role} />
    </div>
  )
}
