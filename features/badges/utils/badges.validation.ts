import { z } from "zod"

export const badgeSchema = z.object({
  name: z.string().min(3, "Badge name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  icon: z.string().min(1),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Invalid color"),
})

export type BadgeInput = z.infer<typeof badgeSchema>
