/**
 * Next.js Route Handler - Backend for Frontend (BFF)
 * 
 * Handles:
 * - Cursor-based pagination (keyset pagination)
 * - Server-side filtering
 * - Supabase queries with optimized indexes
 * - Server-side caching via Next.js cache
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Question,
  PaginatedQuestionsResponse,
  QuestionsQueryParams,
  decodeCursor,
  encodeCursor,
} from "@/lib/types/questions";

export const dynamic = "force-dynamic"; // Disable static optimization for this route
export const revalidate = 60; // Revalidate cache every 60 seconds

export async function GET(request: NextRequest) {
    console.log("API /questions called");
  try {
    const supabase = await createSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const limit = parseInt(searchParams.get("limit") || "20");
    const params: QuestionsQueryParams = {
      cursor: searchParams.get("cursor") || undefined,
      limit,
      topicId: searchParams.get("topicId") || undefined,
      module: searchParams.get("module") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      status: searchParams.get("status") || "approved",
      searchTerm: searchParams.get("searchTerm") || undefined,
      createdBy: searchParams.get("createdBy") || undefined,
    };

    // Decode cursor for keyset pagination
    let cursorData = null;
    if (params.cursor) {
      cursorData = decodeCursor(params.cursor);
      if (!cursorData) {
        return NextResponse.json(
          { error: "Invalid cursor format" },
          { status: 400 }
        );
      }
    }

    // Build Supabase query with cursor-based pagination
    let query = supabase
      .from("questions")
      .select(
        `
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        topic_id,
        difficulty,
        status,
        author_id,
        upvotes,
        downvotes,
        comments_count,
        created_at,
        updated_at,
        topic:topics(id, name, code)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }) // Secondary sort for stable pagination
      .limit(limit + 1); // Fetch one extra to determine hasMore

    // Apply cursor filter (keyset pagination)
    if (cursorData) {
      query = query.or(
        `created_at.lt.${cursorData.timestamp},and(created_at.eq.${cursorData.timestamp},id.lt.${cursorData.id})`
      );
    }

    // Apply filters
    if (params.topicId) {
      query = query.eq("topic_id", params.topicId);
    }

    if (params.difficulty) {
      query = query.eq("difficulty", params.difficulty);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.createdBy) {
      query = query.eq("author_id", params.createdBy);
    }

    // Search filter (uses PostgreSQL full-text search if available)
    if (params.searchTerm) {
      query = query.ilike("question_text", `%${params.searchTerm}%`);
    }

    // Module filter (via topic relation)
    if (params.module) {
      query = query.eq("topic.code", params.module);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // Determine if there are more results
    const hasMore = data.length > limit;
    const questions = hasMore ? data.slice(0, -1) : data;

    // Generate next cursor from last item
    let nextCursor: string | null = null;
    if (hasMore && questions.length > 0) {
      const lastQuestion = questions[questions.length - 1];
      nextCursor = encodeCursor(lastQuestion.created_at, lastQuestion.id);
    }

    const response: PaginatedQuestionsResponse = {
      data: questions as any as Question[],
      nextCursor,
      hasMore,
      total: count || undefined,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Route handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Database Index Requirements for Optimal Performance:
 * 
 * CREATE INDEX idx_questions_created_at_id ON questions(created_at DESC, id DESC);
 * CREATE INDEX idx_questions_topic_id ON questions(topic_id);
 * CREATE INDEX idx_questions_difficulty ON questions(difficulty);
 * CREATE INDEX idx_questions_status ON questions(status);
 * CREATE INDEX idx_questions_author_id ON questions(author_id);
 * CREATE INDEX idx_questions_text_gin ON questions USING gin(to_tsvector('english', question_text));
 * 
 * Composite index for common filter combinations:
 * CREATE INDEX idx_questions_status_topic_created ON questions(status, topic_id, created_at DESC, id DESC);
 */
