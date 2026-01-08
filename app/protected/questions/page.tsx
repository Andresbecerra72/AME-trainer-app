"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MobileHeader } from "@/components/mobile-header";
import { QuestionCard } from "@/components/question-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { supabaseBrowserClient } from "@/lib/supabase/client";
import { use } from "react";

export default function TopicQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered">("all");

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load questions for this topic (real data)
  useEffect(() => {
    loadQuestions();
  }, [id]);

  const loadQuestions = async () => {
    setLoading(true);

    // 1. First get topic_id from id
    const { data: topicData } = await supabaseBrowserClient
      .from("topics")
      .select("id")
      .eq("id", id)
      .single();

    if (!topicData) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    // 2. Now load questions for the topic
    const { data: questionData, error } = await supabaseBrowserClient
      .from("questions")
      .select(
        `
        id,
        question_text,
        is_doubtful,
        created_at,
        user_id,
        question_attempts ( user_id )
      `
      )
      .eq("topic_id", topicData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ERROR LOADING QUESTIONS:", error);
      setQuestions([]);
    } else {
      setQuestions(questionData ?? []);
    }

    setLoading(false);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase());

    const userAttempted = q.question_attempts?.length > 0;

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "answered"
        ? userAttempted
        : !userAttempted;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Question Bank" showBack />

      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filter === "answered" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("answered")}
            className="flex-1"
          >
            Answered
          </Button>
          <Button
            variant={filter === "unanswered" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unanswered")}
            className="flex-1"
          >
            Unanswered
          </Button>
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No questions found
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                questionSnippet={q.question_text}
                isAnswered={q.question_attempts?.length > 0}
                onClick={() => router.push(`/protected/questions/${q.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
