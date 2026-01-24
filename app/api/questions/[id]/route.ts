/**
 * Next.js Route Handler - Single Question Detail
 * 
 * GET /api/questions/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { data, error } = await supabase
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
        topic_id,
        difficulty,
        status,
        explanation,
        created_at,
        updated_at,
        author_id,
        upvotes,
        downvotes,
        comments_count,
        topic:topics(id, name, code)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
