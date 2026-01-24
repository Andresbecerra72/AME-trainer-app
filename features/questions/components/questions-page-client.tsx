/**
 * Questions Page - Main Implementation
 * 
 * Features:
 * - URL-driven filters (shareable, browser-navigation friendly)
 * - Infinite scroll with cursor pagination
 * - Virtualized rendering for performance
 * - Prefetching for smooth UX
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useInfiniteQuestions, usePrefetchNextPage } from "@/features/questions/hooks/use-questions";
import { VirtualizedQuestionList } from "@/features/questions/components/virtualized-question-list";
import { QuestionFilters } from "./question-filters";
import { QuestionFilters as FilterType } from "@/lib/types/questions";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function QuestionsPageClient() {
  const searchParams = useSearchParams();

  // Build filters from URL searchParams
  const filters: FilterType = {
    topicId: searchParams.get("topicId") || undefined,
    module: searchParams.get("module") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    status: searchParams.get("status") || "approved",
    searchTerm: searchParams.get("searchTerm") || undefined,
  };

  // Fetch questions with infinite query
  const {
    allQuestions,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    error,
    refetch,
    data,
  } = useInfiniteQuestions(filters, 20);

  // Get next cursor for prefetching
  const lastPage = data?.pages[data.pages.length - 1];
  const nextCursor = lastPage?.nextCursor;

  // Prefetch next page when near end
  const prefetchNext = usePrefetchNextPage(filters, nextCursor || undefined, 20);

  useEffect(() => {
    // Prefetch when we have 80% of data visible
    if (nextCursor && !isFetchingNextPage && allQuestions.length > 15) {
      prefetchNext();
    }
  }, [nextCursor, isFetchingNextPage, allQuestions.length, prefetchNext]);

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-lg font-medium text-destructive">
          Failed to load questions
        </p>
        <p className="text-sm text-muted-foreground">
          {error?.message || "An unknown error occurred"}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : `${allQuestions.length} ${
                      hasNextPage ? "+" : ""
                    } questions`}
              </p>
            </div>
          </div>
          
          <QuestionFilters />
        </div>
      </div>

      {/* Virtualized list */}
      <div className="flex-1 overflow-hidden">
        <VirtualizedQuestionList
          questions={allQuestions}
          hasMore={hasNextPage || false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          estimatedItemHeight={280}
        />
      </div>
    </div>
  );
}
