"use server"

import { getCollections } from "@/lib/db-actions"
import type { Collection, CollectionWithCount } from "../types"

/**
 * Get user's collections with formatted data
 */
export async function getUserCollections(userId: string): Promise<CollectionWithCount[]> {
  const collections = await getCollections(userId)
  
  return collections.map((collection: Collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    is_public: collection.is_public,
    user_id: collection.user_id,
    created_at: collection.created_at,
    questionCount: collection.question_count?.[0]?.count || 0,
  }))
}
