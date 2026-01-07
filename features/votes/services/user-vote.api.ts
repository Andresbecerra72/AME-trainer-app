"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Get the current user's vote on a specific question
 * Returns: 1 for upvote, -1 for downvote, undefined for no vote
 */
export async function getUserVoteOnQuestion(questionId: string): Promise<number | undefined> {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return undefined
  }

  const { data: vote, error } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .single()

  if (error || !vote) {
    return undefined
  }

  return vote.vote_type
}

/**
 * Get vote counts for a question
 */
export async function getQuestionVoteCounts(questionId: string): Promise<{ upvotes: number; downvotes: number }> {
  const supabase = await createSupabaseServerClient()

  const { data: votes, error } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("question_id", questionId)

  if (error || !votes) {
    return { upvotes: 0, downvotes: 0 }
  }

  const upvotes = votes.filter(v => v.vote_type === 1).length
  const downvotes = votes.filter(v => v.vote_type === -1).length

  return { upvotes, downvotes }
}
