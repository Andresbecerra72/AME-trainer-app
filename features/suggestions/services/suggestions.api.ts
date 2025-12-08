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
