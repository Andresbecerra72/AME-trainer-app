"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(100),
  description: z.string().max(500).optional(),
})

export async function createCollection(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
  }

  const validatedData = createCollectionSchema.parse(rawData)

  const { error } = await supabase.from("collections").insert({
    name: validatedData.name,
    description: validatedData.description,
    user_id: user.id,
  })

  if (error) {
    throw new Error(`Failed to create collection: ${error.message}`)
  }

  redirect("/protected/collections")
}

export async function getCollections(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("collections")
    .select("*, question_count:collection_questions(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching collections:", error)
    return []
  }

  return data
}
