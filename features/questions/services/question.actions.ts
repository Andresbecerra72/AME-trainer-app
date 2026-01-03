"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getQuestionsByCategory(categoryPrefix: string) {
  const supabase = await createSupabaseServerClient()

  try {
    // First, get all topics that match the prefix
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("id, name, code")
      .like("code", `${categoryPrefix}%`)

    if (topicsError || !topics || topics.length === 0) {
      console.error("Error fetching topics:", topicsError)
      return []
    }

    const topicIds = topics.map(t => t.id)

    // Then get questions for those topics
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        topic_id
      `)
      .eq("status", "approved")
      .in("topic_id", topicIds)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching questions:", error)
      return []
    }

    // Attach topic info to each question
    const questionsWithTopics = data.map(q => {
      const topic = topics.find(t => t.id === q.topic_id)
      return {
        ...q,
        topic: {
          name: topic?.name || "Unknown",
          code: topic?.code || "N/A"
        }
      }
    })

    return questionsWithTopics
  } catch (error) {
    console.error("Error in getQuestionsByCategory:", error)
    return []
  }
}

export async function getQuestionsByTopic(topicId: string) {
  const supabase = await createSupabaseServerClient()

  try {
    // Get topic info
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select("id, name, code")
      .eq("id", topicId)
      .single()

    if (topicError || !topic) {
      console.error("Error fetching topic:", topicError)
      return []
    }

    // Get questions
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation
      `)
      .eq("status", "approved")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching questions:", error)
      return []
    }

    // Attach topic info
    const questionsWithTopics = data.map(q => ({
      ...q,
      topic: {
        name: topic.name,
        code: topic.code
      }
    }))

    return questionsWithTopics
  } catch (error) {
    console.error("Error in getQuestionsByTopic:", error)
    return []
  }
}
