/**
 * Virtualized Question List Component
 * 
 * Features:
 * - Renders only visible items (performance optimization)
 * - Supports infinite loading
 * - Smooth scrolling with proper measurements
 * - Skeleton loading states
 */

"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect } from "react";
import { Question } from "@/lib/types/questions";
import { QuestionCard } from "@/components/question-card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VirtualizedQuestionListProps {
  questions: Question[];
  hasMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  estimatedItemHeight?: number;
}

export function VirtualizedQuestionList({
  questions,
  hasMore,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  estimatedItemHeight = 250,
}: VirtualizedQuestionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: hasMore ? questions.length + 1 : questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan: 5, // Render 5 items above/below viewport
  });

  const items = virtualizer.getVirtualItems();

  // Auto-fetch next page when user scrolls near the end
  useEffect(() => {
    const [lastItem] = [...items].reverse();

    if (!lastItem) return;

    // Trigger fetch when last item is visible and we have more data
    if (
      lastItem.index >= questions.length - 1 &&
      hasMore &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasMore,
    fetchNextPage,
    questions.length,
    isFetchingNextPage,
    items,
  ]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <QuestionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No questions found
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {items.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > questions.length - 1;
          const question = questions[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                hasMore ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading more questions...
                    </span>
                  </div>
                ) : null
              ) : (
                <div className="px-4 py-2">
                  <QuestionCard 
                    questionSnippet={question.question_text}
                    isAnswered={false}
                    onClick={() => {/* TODO: handle click */}}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for question cards
 */
function QuestionCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
