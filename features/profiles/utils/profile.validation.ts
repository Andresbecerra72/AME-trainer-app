import { z } from "zod"

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(60),
  bio: z.string().max(280).optional(),
})
