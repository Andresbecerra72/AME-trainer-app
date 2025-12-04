import { supabaseBrowserClient } from "@/lib/supabase/client";
import { questionSchema } from "../utils/question.validation";

export async function createQuestion(payload: any) {
  const parsed = questionSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Invalid question data");

  const { data, error } = await supabaseBrowserClient
    .from("questions")
    .insert(parsed.data)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function voteQuestion(questionId: string, value: number) {
  return await supabaseBrowserClient.rpc("vote_question", {
    p_question_id: questionId,
    p_vote: value,
  });
}

export async function reportQuestion(questionId: string, reason: string) {
  return await supabaseBrowserClient.from("question_reports").insert({
    question_id: questionId,
    reason,
  });
}

export async function markQuestionAsDoubtful(questionId: string) {
  return await supabaseBrowserClient
    .from("questions")
    .update({ is_doubtful: true })
    .eq("id", questionId);
}
