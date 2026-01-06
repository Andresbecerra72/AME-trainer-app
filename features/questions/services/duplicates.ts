"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

interface DuplicateResult {
  id: string
  question_text: string
  similarity: number
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  // Exact match
  if (s1 === s2) return 100
  
  // Calculate Levenshtein distance
  const matrix: number[][] = []
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  const distance = matrix[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  const similarity = ((maxLength - distance) / maxLength) * 100
  
  return Math.round(similarity)
}

/**
 * Normalize question text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // normalize whitespace
    .replace(/[^\w\s]/g, "") // remove punctuation
}

/**
 * Check if a question already exists (server-side validation)
 */
export async function validateQuestionUniqueness(
  questionText: string
): Promise<{ isUnique: boolean; duplicate?: DuplicateResult }> {
  try {
    console.log("🔍 [validateQuestionUniqueness] Input:", questionText)
    console.log("📏 Length:", questionText.length, "characters")
    
    if (!questionText || questionText.trim().length < 5) {
      console.log("⚠️ Question too short (< 5 chars), skipping validation")
      return { isUnique: true }
    }

    const supabase = await createSupabaseServerClient()
    const normalized = normalizeText(questionText)
    console.log("📝 Normalized text:", normalized)

    // Fetch all questions
    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, question_text, status")
      .in("status", ["approved", "pending"])

    if (error) {
      console.error("❌ Error validating uniqueness:", error)
      return { isUnique: true } // Allow on error to not block users
    }

    if (!questions || questions.length === 0) {
      console.log("✅ No questions in database, allowing")
      return { isUnique: true }
    }

    console.log(`🔎 Checking against ${questions.length} existing questions`)

    // Check for duplicates with high threshold (90%)
    for (const q of questions) {
      const normalizedExisting = normalizeText(q.question_text)
      const similarity = calculateSimilarity(normalized, normalizedExisting)
      
      if (similarity > 50) { // Only log significant similarities
        console.log(`📊 Comparing with question ${q.id.substring(0, 8)}...: ${similarity}%`)
      }
      
      if (similarity >= 90) {
        console.log(`❌ DUPLICATE FOUND! ${similarity}% similar to question ${q.id}`)
        console.log(`   Existing: "${q.question_text}"`)
        console.log(`   New: "${questionText}"`)
        return {
          isUnique: false,
          duplicate: {
            id: q.id,
            question_text: q.question_text,
            similarity,
          },
        }
      }
    }

    console.log("✅ Question is unique, no high similarity matches found")
    return { isUnique: true }
  } catch (error) {
    console.error("❌ Error in validateQuestionUniqueness:", error)
    return { isUnique: true }
  }
}

export async function checkQuestionDuplicates(questionText: string): Promise<DuplicateResult[]> {
  try {
    if (!questionText || questionText.trim().length < 5) {
      return []
    }

    const supabase = await createSupabaseServerClient()
    const normalized = normalizeText(questionText)

    // Fetch all questions (approved and pending)
    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, question_text, status")
      .in("status", ["approved", "pending"])

    if (error) {
      console.error("Error fetching questions:", error)
      return []
    }

    if (!questions || questions.length === 0) {
      console.log("No questions found in database")
      return []
    }

    console.log(`Checking against ${questions.length} questions`)

    // Calculate similarity for all questions
    const duplicates = questions
      .map((q) => ({
        ...q,
        similarity: calculateSimilarity(normalized, normalizeText(q.question_text)),
      }))
      .filter((q) => q.similarity >= 60)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    console.log(`Found ${duplicates.length} duplicates with similarity >= 60%`)
    if (duplicates.length > 0) {
      console.log("Top duplicate:", duplicates[0].question_text, `(${duplicates[0].similarity}%)`)
    }

    return duplicates
  } catch (error) {
    console.error("Error checking duplicates:", error)
    return []
  }
}
