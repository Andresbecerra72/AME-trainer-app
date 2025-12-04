"use client";

import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export function useQuestions(topicId?: string) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabaseBrowserClient
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (topicId) query = query.eq("topic_id", topicId);

    query.then(({ data }) => {
      setQuestions(data ?? []);
      setLoading(false);
    });
  }, [topicId]);

  return { questions, loading };
}
