import { z } from "zod"

export const questionFormSchema = z.object({
  question_text: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(1000, "Question is too long"),
  option_a: z.string().min(1, "Option A is required").max(500, "Option is too long"),
  option_b: z.string().min(1, "Option B is required").max(500, "Option is too long"),
  option_c: z.string().min(1, "Option C is required").max(500, "Option is too long"),
  option_d: z.string().min(1, "Option D is required").max(500, "Option is too long"),
  correct_answer: z.enum(["A", "B", "C", "D"], {
    required_error: "Please select the correct answer",
  }),
  explanation: z.string().min(10, "Explanation must be at least 10 characters").max(2000),
  topic_id: z.string().min(1, "Please select a topic"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "Please select difficulty",
  }),
})

export type QuestionFormValues = z.infer<typeof questionFormSchema>

export const communityFiltersSchema = z.object({
  search: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["all", "easy", "medium", "hard"]).optional(),
  sort: z.enum(["recent", "popular", "unanswered"]).optional(),
})

export type CommunityFiltersValues = z.infer<typeof communityFiltersSchema>

/**
 * Validate question form data
 * Returns validation result with errors array
 */
export function validateQuestionData(data: QuestionFormValues): { 
  valid: boolean
  errors: string[] 
} {
  const errors: string[] = []

  if (!data.question_text || data.question_text.length < 10) {
    errors.push("Question text must be at least 10 characters")
  }

  if (!data.option_a || !data.option_b || !data.option_c || !data.option_d) {
    errors.push("All four answer options are required")
  }

  if (!["A", "B", "C", "D"].includes(data.correct_answer)) {
    errors.push("Invalid correct answer selection")
  }

  if (!data.topic_id) {
    errors.push("Topic is required")
  }

  if (!["easy", "medium", "hard"].includes(data.difficulty)) {
    errors.push("Invalid difficulty level")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
