import { z } from "zod";

export const questionSchema = z.object({
  question_text: z.string().min(10),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().min(1),
  option_d: z.string().min(1),
  correct_option: z.enum(["a", "b", "c", "d"]),
  topic_id: z.string().uuid(),
  source: z.string().optional(),
});
