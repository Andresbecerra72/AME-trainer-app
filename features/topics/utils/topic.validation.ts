/**
 * Validation schemas for topic management
 */

import { z } from "zod"

/**
 * Single topic validation
 */
export const topicSchema = z.object({
  name: z
    .string()
    .min(3, "Topic name must be at least 3 characters")
    .max(100, "Topic name must not exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  code: z
    .string()
    .regex(
      /^[MES]-[A-Z]{2,3}-\d{2,3}$/,
      "Code must follow format: RATING-CATEGORY-NUMBER (e.g., M-SPM-01)"
    ),
  icon: z.string().min(1, "Icon is required"),
  ratingId: z.enum(["M", "E", "S"], {
    errorMap: () => ({ message: "Rating must be M, E, or S" }),
  }),
  categoryId: z.string().min(1, "Category is required"),
})

/**
 * Batch topic creation validation
 */
export const topicBatchSchema = z.object({
  topics: z
    .array(topicSchema)
    .min(1, "At least one topic is required")
    .max(50, "Cannot create more than 50 topics at once"),
})

/**
 * Topic update validation (partial)
 */
export const topicUpdateSchema = topicSchema.partial().extend({
  id: z.string().uuid("Invalid topic ID"),
})

/**
 * Type exports
 */
export type TopicInput = z.infer<typeof topicSchema>
export type TopicBatchInput = z.infer<typeof topicBatchSchema>
export type TopicUpdateInput = z.infer<typeof topicUpdateSchema>
