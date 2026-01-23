/**
 * Example Integration: Using the New Architecture in Existing Features
 * 
 * This file demonstrates how to integrate the new TanStack Query architecture
 * into existing parts of the application.
 */

"use client";

// Common imports used across examples
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuestions, useQuestion, questionKeys } from "@/features/questions/hooks/use-questions";
import { useQuestionUIStore } from "@/stores/question-ui-store";
import { VirtualizedQuestionList } from "@/features/questions/components/virtualized-question-list";
import { QuestionCard } from "@/components/question-card";
import { Question } from "@/lib/types/questions";

// ============================================================================
// EXAMPLE 1: Simple Question List
// ============================================================================

export function SimpleQuestionList() {
  const { allQuestions, isLoading } = useInfiniteQuestions(
    { status: "approved" },
    20
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {allQuestions.map((question) => (
        <QuestionCard 
          key={question.id} 
          questionSnippet={question.question_text}
          isAnswered={false}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Filtered Questions with URL Sync
// ============================================================================

export function FilteredQuestions() {
  const searchParams = useSearchParams();

  const filters = {
    difficulty: searchParams.get("difficulty") || undefined,
    status: searchParams.get("status") || "approved",
  };

  const {
    allQuestions,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuestions(filters, 20);

  return (
    <VirtualizedQuestionList
      questions={allQuestions}
      hasMore={hasNextPage || false}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
    />
  );
}

// ============================================================================
// EXAMPLE 3: Topic-Specific Questions
// ============================================================================

interface TopicQuestionsProps {
  topicId: string;
}

export function TopicQuestions({ topicId }: TopicQuestionsProps) {
  const { allQuestions, isLoading, hasNextPage, fetchNextPage } =
    useInfiniteQuestions({ topicId, status: "approved" }, 15);

  return (
    <div>
      <h2>Questions for Topic {topicId}</h2>
      {isLoading ? (
        <p>Loading questions...</p>
      ) : (
        <>
          {allQuestions.map((q) => (
            <div key={q.id}>{q.question_text}</div>
          ))}
          {hasNextPage && (
            <button onClick={() => fetchNextPage()}>Load More</button>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Practice Mode with UI State
// ============================================================================

export function PracticeMode() {
  const { allQuestions } = useInfiniteQuestions({ status: "approved" }, 50);

  const {
    quizProgress,
    startQuiz,
    answerQuestion,
    nextQuestion,
    endQuiz,
  } = useQuestionUIStore();

  const currentQuestion = allQuestions[quizProgress.currentQuestionIndex];

  if (!quizProgress.startedAt) {
    return <button onClick={startQuiz}>Start Practice</button>;
  }

  if (!currentQuestion) {
    return (
      <div>
        <h2>Practice Complete!</h2>
        <p>Answered: {quizProgress.answeredQuestions.size} questions</p>
        <button onClick={endQuiz}>End Practice</button>
      </div>
    );
  }

  const options = [
    { id: 'A', text: currentQuestion.option_a },
    { id: 'B', text: currentQuestion.option_b },
    { id: 'C', text: currentQuestion.option_c },
    { id: 'D', text: currentQuestion.option_d }
  ];

  return (
    <div>
      <h3>
        Question {quizProgress.currentQuestionIndex + 1} / {allQuestions.length}
      </h3>
      <p>{currentQuestion.question_text}</p>
      <div>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              answerQuestion(currentQuestion.id);
              nextQuestion();
            }}
          >
            {option.id}. {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Search Results
// ============================================================================

export function QuestionSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { allQuestions, isLoading } = useInfiniteQuestions(
    { searchTerm: debouncedSearch, status: "approved" },
    20
  );

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search questions..."
      />
      {isLoading ? (
        <p>Searching...</p>
      ) : (
        <div>
          {allQuestions.length === 0 ? (
            <p>No results found</p>
          ) : (
            allQuestions.map((q) => <div key={q.id}>{q.question_text}</div>)
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Question Details Modal
// ============================================================================

export function QuestionDetailsModal() {
  const { selectedQuestionId, setSelectedQuestionId } = useQuestionUIStore();

  const { data: question, isLoading } = useQuestion(selectedQuestionId);

  if (!selectedQuestionId) return null;

  const options = question ? [
    { id: 'A', text: question.option_a, isCorrect: question.correct_answer === 'A' },
    { id: 'B', text: question.option_b, isCorrect: question.correct_answer === 'B' },
    { id: 'C', text: question.option_c, isCorrect: question.correct_answer === 'C' },
    { id: 'D', text: question.option_d, isCorrect: question.correct_answer === 'D' }
  ] : [];

  return (
    <div className="modal">
      <button onClick={() => setSelectedQuestionId(null)}>Close</button>
      {isLoading ? (
        <p>Loading question...</p>
      ) : question ? (
        <div>
          <h2>{question.question_text}</h2>
          <p>Difficulty: {question.difficulty}</p>
          <div>
            {options.map((option) => (
              <div key={option.id}>
                {option.id}. {option.text} {option.isCorrect && "✓"}
              </div>
            ))}
          </div>
          {question.explanation && (
            <p className="explanation">{question.explanation}</p>
          )}
        </div>
      ) : (
        <p>Question not found</p>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Prefetching on Hover
// ============================================================================

interface QuestionLinkProps {
  questionId: string;
  children: React.ReactNode;
}

export function QuestionLink({ questionId, children }: QuestionLinkProps) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: questionKeys.detail(questionId),
      queryFn: () => fetch(`/api/questions/${questionId}`).then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <a href={`/questions/${questionId}`} onMouseEnter={prefetch}>
      {children}
    </a>
  );
}

// ============================================================================
// EXAMPLE 8: Manual Cache Updates (After Creating Question)
// ============================================================================

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  const createQuestion = async (data: Partial<Question>) => {
    const response = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create question");

    const newQuestion: Question = await response.json();

    // Invalidate all question lists to refetch
    queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

    return newQuestion;
  };

  return { createQuestion };
}
