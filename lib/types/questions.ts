/**
 * Core Question Types
 * Used across API, hooks, and components
 */

export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation?: string;
  topic_id: string;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "approved" | "rejected";
  author_id: string;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  
  // Relations (optional, loaded when needed)
  topic?: {
    id: string;
    name: string;
    code: string;
  };
}

// Legacy Answer interface (no longer used in main DB schema)
export interface Answer {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  explanation?: string;
  created_at: string;
}

/**
 * Filter Types
 */
export interface QuestionFilters {
  topicId?: string;
  module?: string;
  difficulty?: string;
  status?: string;
  searchTerm?: string;
  createdBy?: string;
}

/**
 * API Request/Response Types
 */
export interface QuestionsQueryParams extends QuestionFilters {
  cursor?: string;
  limit?: number;
}

export interface PaginatedQuestionsResponse {
  data: Question[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

/**
 * Cursor format: timestamp_id
 * Example: 2026-01-22T10:30:00.000Z_abc123
 */
export interface CursorData {
  timestamp: string;
  id: string;
}

export function encodeCursor(timestamp: string, id: string): string {
  return `${timestamp}_${id}`;
}

export function decodeCursor(cursor: string): CursorData | null {
  try {
    const [timestamp, id] = cursor.split("_");
    if (!timestamp || !id) return null;
    return { timestamp, id };
  } catch {
    return null;
  }
}
