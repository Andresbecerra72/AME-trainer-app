"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getActiveChallenge, getChallengeLeaderboard } from "@/lib/db-actions"
import type { ChallengePageData, ChallengeAttempt } from "../types"

/**
 * Get challenge page data including active challenge, leaderboard, and user attempt
 */
export async function getChallengePageData(userId: string): Promise<ChallengePageData> {
  const supabase = await createSupabaseServerClient()
  
  // Get active challenge
  const challenge = await getActiveChallenge()
  
  // Get leaderboard if challenge exists
  const leaderboard = challenge 
    ? await getChallengeLeaderboard(challenge.id, 10) 
    : []

  // Get user's attempt if challenge exists
  let userAttempt: ChallengeAttempt | null = null
  if (challenge) {
    const { data } = await supabase
      .from("challenge_attempts")
      .select("*")
      .eq("challenge_id", challenge.id)
      .eq("user_id", userId)
      .single()
    
    userAttempt = data as ChallengeAttempt | null
  }

  return {
    challenge,
    leaderboard,
    userAttempt,
  }
}
