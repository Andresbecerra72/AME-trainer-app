"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface UpvotedQuestion {
  id: string
  question_text: string
  status: string
  upvotes: number
  comment_count: number
  created_at: string
  upvoted_at: string
  topic: {
    name: string
    code: string
  }
  author: {
    display_name: string | null
    avatar_url: string | null
  }
}

export async function getUserUpvotedQuestions(userId: string): Promise<UpvotedQuestion[]> {
  const supabase = await createSupabaseServerClient()

  // Validate userId
  if (!userId || userId.trim() === "") {
    console.error("Invalid userId provided to getUserUpvotedQuestions")
    return []
  }

  console.log("Fetching upvoted questions for userId:", userId)

  // First, get all votes for the user with vote_type = 1 (upvote)
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("*")
    .eq("user_id", userId)
    .eq("vote_type", 1)
    .order("created_at", { ascending: false })

  console.log("Votes query result:", { votes, votesError })

  if (votesError) {
    console.error("Error fetching votes:", {
      error: votesError,
      message: votesError.message,
      details: votesError.details,
      hint: votesError.hint,
      code: votesError.code,
      userId,
    })
    return []
  }

  if (!votes || votes.length === 0) {
    console.log("No upvoted questions found for user:", userId)
    return []
  }

  console.log(`Found ${votes.length} votes`)

  // Get all question IDs
  const questionIds = votes.map((v) => v.question_id)

  // Fetch questions with their details
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, question_text, status, upvotes, comment_count, created_at, topic_id, author_id")
    .in("id", questionIds)

  if (questionsError) {
    console.error("Error fetching questions:", questionsError)
    return []
  }

  if (!questions || questions.length === 0) {
    return []
  }

  // Get unique topic and author IDs
  const topicIds = [...new Set(questions.map((q) => q.topic_id).filter(Boolean))]
  const authorIds = [...new Set(questions.map((q) => q.author_id).filter(Boolean))]

  // Fetch topics
  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, code")
    .in("id", topicIds)

  // Fetch authors
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", authorIds)

  // Create maps for efficient lookup
  const topicsMap = new Map(topics?.map((t) => [t.id, t]) || [])
  const authorsMap = new Map(authors?.map((a) => [a.id, a]) || [])
  const questionsMap = new Map(questions.map((q) => [q.id, q]))
  const votesMap = new Map(votes.map((v) => [v.question_id, v]))

  // Transform the data
  const upvotedQuestions: UpvotedQuestion[] = questions
    .map((question) => {
      const vote = votesMap.get(question.id)
      const topic = topicsMap.get(question.topic_id)
      const author = authorsMap.get(question.author_id)

      return {
        id: question.id,
        question_text: question.question_text,
        status: question.status,
        upvotes: question.upvotes || 0,
        comment_count: question.comment_count || 0,
        created_at: question.created_at,
        upvoted_at: vote?.created_at || question.created_at,
        topic: {
          name: topic?.name || "Unknown",
          code: topic?.code || "",
        },
        author: {
          display_name: author?.display_name || null,
          avatar_url: author?.avatar_url || null,
        },
      }
    })
    .sort((a, b) => new Date(b.upvoted_at).getTime() - new Date(a.upvoted_at).getTime())

  return upvotedQuestions
}
