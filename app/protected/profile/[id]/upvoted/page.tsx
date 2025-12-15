import { MobileHeader } from "@/components/mobile-header"
import { QuestionCardItem } from "@/components/question-card-item"
import { EmptyState } from "@/components/empty-state"
import { ThumbsUp } from "lucide-react"
import { notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { supabaseBrowserClient } from "@/lib/supabase/client"

export default async function UpvotedPage({ params }: { params: { id: string } }) {
  const supabase =  supabaseBrowserClient
  const { id } = await params


  //const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).single()
   const { user, profile } = await getSession()
  

  if (!profile) notFound()

  const { data: upvotedVotes } = await supabase
    .from("votes")
    .select(`
      created_at,
      questions (
        *,
        topics (name, code),
        profiles:author_id (username, avatar_url)
      )
    `)
    .eq("user_id", id)
    .eq("vote_type", "up")
    .order("created_at", { ascending: false })

  const upvotedQuestions = (upvotedVotes || [])
    .filter((v) => v.questions)
    .map((v: any) => ({
      ...v.questions,
      upvoted_at: v.created_at,
    }))

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Upvoted Questions" showBack />

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-green-500/10 to-primary/10 rounded-lg p-4">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Upvoted Questions
          </h2>
          <p className="text-sm text-muted-foreground">{upvotedQuestions.length} questions upvoted</p>
        </div>

        <div className="space-y-3">
          {upvotedQuestions.length === 0 ? (
            <EmptyState
              icon={ThumbsUp}
              title="No upvoted questions"
              description="Questions you upvote will appear here."
              actionLabel="Browse Questions"
              actionHref="/protected/community"
            />
          ) : (
            upvotedQuestions.map((question: any) => <QuestionCardItem key={question.id} question={question} />)
          )}
        </div>
      </div>

      <BottomNav userRole={profile.role} />
    </div>
  )
}
