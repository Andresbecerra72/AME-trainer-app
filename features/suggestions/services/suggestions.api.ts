"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { EditSuggestionSchema, ReviewSchema } from "../utils/suggestions.validations";

// -----------------------------
// Create Suggestion (USER)
// -----------------------------

export async function createEditSuggestion(input: z.infer<typeof EditSuggestionSchema>) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  const validated = EditSuggestionSchema.parse(input);

  const insertPayload = {
    ...validated,
    user_id: authData.user.id,
  };

  const { data, error } = await supabase
    .from("edit_suggestions")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("[createEditSuggestion] Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/questions");
  return data;
}

// -----------------------------
// Get Own Suggestions (USER)
// -----------------------------

export async function getMyEditSuggestions() {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("edit_suggestions")
    .select(
      `
        *,
        question:questions(id, question_text)
      `
    )
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getMyEditSuggestions] Error:", error);
    throw new Error(error.message);
  }

  return data || [];
}

// -----------------------------
// Get All Suggestions (ADMIN / SUPER ADMIN)
// -----------------------------

export async function getAllEditSuggestions() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("edit_suggestions")
    .select(
      `
        *,
        question:questions(*),
        suggested_by_user:profiles!user_id(*),
        reviewed_by_user:profiles!reviewed_by(*)
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllEditSuggestions] Error:", error);
    throw new Error(error.message);
  }

  return data || [];
}

// -----------------------------
// Review Suggestion (ADMIN)
// -----------------------------

export async function reviewEditSuggestion(input: z.infer<typeof ReviewSchema>) {
  const supabase = await createSupabaseServerClient();

  const validated = ReviewSchema.parse(input);

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  const { data, error } = await supabase
    .from("edit_suggestions")
    .update({
      status: validated.status,
      reviewed_by: authData.user.id,
      reviewer_notes: validated.reviewer_notes ?? null,
    })
    .eq("id", validated.id)
    .select()
    .single();

  if (error) {
    console.error("[reviewEditSuggestion] Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/edit-suggestions");

  return data;
}

// -----------------------------
// Delete Suggestion (OWNER or ADMIN)
// -----------------------------

export async function deleteEditSuggestion(id: string) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("edit_suggestions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteEditSuggestion] Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/questions");
  return { success: true };
}

// -----------------------------
// Approve Suggestion with Changes (ADMIN)
// -----------------------------

export async function approveSuggestionWithChanges(suggestionId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  // Get the suggestion
  const { data: suggestion, error: fetchError } = await supabase
    .from("edit_suggestions")
    .select("*")
    .eq("id", suggestionId)
    .single();

  if (fetchError || !suggestion) {
    throw new Error("Suggestion not found");
  }

  // Update suggestion status
  const { error: updateError } = await supabase
    .from("edit_suggestions")
    .update({
      status: "approved",
      reviewed_by: authData.user.id,
    })
    .eq("id", suggestionId);

  if (updateError) {
    console.error("[approveSuggestionWithChanges] Error updating suggestion:", updateError);
    throw new Error(updateError.message);
  }

  // Apply changes to the question
  const { error: questionError } = await supabase
    .from("questions")
    .update({
      question_text: suggestion.proposed_question_text,
      option_a: suggestion.proposed_answers.option_a,
      option_b: suggestion.proposed_answers.option_b,
      option_c: suggestion.proposed_answers.option_c,
      option_d: suggestion.proposed_answers.option_d,
      correct_option: suggestion.proposed_answers.correct_option,
    })
    .eq("id", suggestion.question_id);

  if (questionError) {
    console.error("[approveSuggestionWithChanges] Error updating question:", questionError);
    throw new Error(questionError.message);
  }

  revalidatePath("/admin/edit-suggestions");
  revalidatePath(`/protected/community/questions/${suggestion.question_id}`);
  
  return { success: true };
}

// -----------------------------
// Reject Suggestion (ADMIN)
// -----------------------------

export async function rejectSuggestionAction(suggestionId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("Not authenticated");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  const { error } = await supabase
    .from("edit_suggestions")
    .update({
      status: "rejected",
      reviewed_by: authData.user.id,
    })
    .eq("id", suggestionId);

  if (error) {
    console.error("[rejectSuggestionAction] Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/edit-suggestions");
  
  return { success: true };
}
