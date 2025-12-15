import { z } from "zod";

export const EditSuggestionSchema = z.object({
  question_id: z.string().uuid(),
  proposed_question_text: z.string().min(10, "Question text is too short"),
  proposed_answers: z
    .array(z.string().min(1))
    .length(4, "There must be exactly 4 answers"),
  proposed_correct_index: z.number().int().min(0).max(3),
  reason: z.string().min(5, "Please provide a valid reason for the suggestion"),
});

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reviewer_notes: z.string().optional(),
});
