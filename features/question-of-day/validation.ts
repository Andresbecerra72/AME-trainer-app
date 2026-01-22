import { z } from "zod"

export const questionOfDayDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD"),
})

export type QuestionOfDayDateInput = z.infer<typeof questionOfDayDateSchema>
