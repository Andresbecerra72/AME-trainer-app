import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { Trophy, Clock, Users, Calendar } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getActiveChallenge, getChallengeLeaderboard } from "@/lib/db-actions"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"

export default async function ChallengesPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const challenge = await getActiveChallenge()
  const leaderboard = challenge ? await getChallengeLeaderboard(challenge.id, 10) : []

  const { data: userAttempt } = challenge
    ? await supabase
        .from("challenge_attempts")
        .select("*")
        .eq("challenge_id", challenge.id)
        .eq("user_id", user.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Weekly Challenge" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {!challenge ? (
          <EmptyState
            icon={Trophy}
            title="No active challenge"
            description="Check back soon for the next weekly challenge!"
          />
        ) : (
          <>
            <MobileCard className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{challenge.title}</h2>
                    {challenge.description && (
                      <p className="text-sm text-muted-foreground mt-2">{challenge.description}</p>
                    )}
                  </div>
                  <Trophy className="w-8 h-8 text-primary flex-shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Questions
                    </div>
                    <div className="text-2xl font-bold text-foreground">{challenge.question_count}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Participants
                    </div>
                    <div className="text-2xl font-bold text-foreground">{leaderboard.length}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Ends{" "}
                    {new Date(challenge.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {userAttempt ? (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Challenge Completed!</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your score: {userAttempt.score}/{userAttempt.total_questions}
                        </p>
                      </div>
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                ) : (
                  <Link href={`/challenges/${challenge.id}/take`}>
                    <PrimaryButton className="w-full">Start Challenge</PrimaryButton>
                  </Link>
                )}
              </div>
            </MobileCard>

            <MobileCard>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Leaderboard
              </h3>
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No attempts yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((attempt: any, index: number) => (
                    <div key={attempt.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div
                        className={`text-lg font-bold ${
                          index === 0
                            ? "text-yellow-600"
                            : index === 1
                              ? "text-gray-500"
                              : index === 2
                                ? "text-amber-700"
                                : "text-muted-foreground"
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {attempt.user?.display_name || "Anonymous"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.score}/{attempt.total_questions} • {Math.floor(attempt.time_taken / 60)}m{" "}
                          {attempt.time_taken % 60}s
                        </p>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {Math.round((attempt.score / attempt.total_questions) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </MobileCard>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
