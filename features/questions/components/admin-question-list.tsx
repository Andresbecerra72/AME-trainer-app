"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Info, User, RefreshCw, Loader2 } from "lucide-react";   
import { EditButtonClient } from "./edit-button-client";
import { DeleteButtonClient } from "./delete-button-client";
import { StatusUpdateButton } from "./status-update-button";
import { useSearchParams } from "next/navigation";
import { questionKeys, useInfiniteQuestions, usePrefetchNextPage, useTotalQuestionCount } from "../hooks/use-questions";
import { useEffect, useRef } from "react";
import { AdminQuestionFiltersProps, QuestionFilters as FilterType } from "@/lib/types/questions";
import { useVirtualizer } from "@tanstack/react-virtual";

export function AdminQuestionList({ topics }: AdminQuestionFiltersProps) {
const searchParams = useSearchParams();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { 
          label: "Approved", 
          className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
        }
      case "rejected":
        return { 
          label: "Rejected", 
          className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
        }
      case "pending":
        return { 
          label: "Pending", 
          className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
        }
      default:
        return { 
          label: "Unknown", 
          className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
        }
    }
  }

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return { label: "Easy", className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" }
      case "medium":
        return { label: "Medium", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" }
      case "hard":
        return { label: "Hard", className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" }
      default:
        return { label: "Unknown", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20" }
    }
  }

   // Build filters from URL searchParams
  const filters: FilterType = {
    topicId: searchParams.get("topicId") || undefined,
    module: searchParams.get("module") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    status: searchParams.get("status") || "approved",
    searchTerm: searchParams.get("search") || undefined,
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

  const totalQuestions = useTotalQuestionCount(filters);

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

    const parentRef = useRef<HTMLDivElement>(null);
    const estimatedItemHeight = 250; // Adjust based on your item height
  
    // Create virtualizer instance
    const virtualizer = useVirtualizer({
      count: hasNextPage ? allQuestions.length + 1 : allQuestions.length,
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
        lastItem.index >= allQuestions.length - 1 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    }, [
      hasNextPage,
      fetchNextPage,
      allQuestions.length,
      isFetchingNextPage,
      items,
    ]);

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
      <>
        {/* Stats */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{allQuestions.length}</span> question{allQuestions.length !== 1 ? "s " : " "}
             of <span className="font-semibold text-foreground">{totalQuestions}</span>
          </p>
        </div>
        <div>
          {/* Questions List */}
        {allQuestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No questions found</p>
            </CardContent>
          </Card>
        ) : (
              <div
              ref={parentRef}
              className="h-full overflow-auto"
              style={{ contain: "strict", minHeight: "800px" }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {items.map((virtualRow) => {
                  const isLoaderRow = virtualRow.index > allQuestions.length - 1;
                  const question = allQuestions[virtualRow.index];
                  const statusConfig = getStatusConfig(question?.status)
                  const difficultyConfig = getDifficultyConfig(question?.difficulty)
                 const correctAnswerText = question ? question[`option_${question.correct_answer.toLowerCase()}` as keyof typeof question] as string : ''

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
                        hasNextPage ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">
                              Loading more questions...
                            </span>
                          </div>
                        ) : null
                      ) : (
                        <div className="px-4 py-2">
                                          <Card 
                  key={question.id} 
                  id={`question-${virtualRow.index}`}
                  className="overflow-hidden shadow-sm hover:shadow-md transition-all scroll-mt-20"
                >
                  <CardContent className="p-0">
                    {/* Compact Header */}
                    <div className="bg-gradient-to-r from-primary/5 to-transparent px-3 py-2 border-b">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Left: Author + Date */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                            <span className="truncate font-medium text-foreground">
                              {question.author?.full_name || "Anonymous"}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline whitespace-nowrap">
                              {new Date(question.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Right: Badges */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge className={`${statusConfig.className} border text-[10px] px-1.5 py-0 h-5`}>
                            {statusConfig.label}
                          </Badge>
                          {question.topic && (
                            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-5">
                              {question.topic.code}
                            </Badge>
                          )}
                          <Badge className={`${difficultyConfig.className} border text-[10px] px-1.5 py-0 h-5`}>
                            {difficultyConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-3">
                      {/* Question */}
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                        {question.question_text}
                      </h3>

                      {/* Correct Answer Only */}
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-500 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {question.correct_answer}
                          </div>
                          <p className="text-sm leading-relaxed flex-1">{correctAnswerText}</p>
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        </div>
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            <span>View explanation</span>
                          </summary>
                          <div className="mt-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-2.5">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-2 bg-muted/30 border-t">
                      <div className="flex gap-1.5">
                        <EditButtonClient 
                          question={{
                            id: question.id,
                            question_text: question.question_text,
                            option_a: question.option_a,
                            option_b: question.option_b,
                            option_c: question.option_c,
                            option_d: question.option_d,
                            correct_answer: question.correct_answer,
                            topic_id: question.topic_id,
                            difficulty: question.difficulty,
                            explanation: question.explanation,
                          }}
                          topics={topics}
                        />

                        <div className="flex-1">
                          <StatusUpdateButton
                            questionId={question.id}
                            status={question.status === "approved" ? "rejected" : "approved"}
                            currentStatus={question.status}
                            variant={question.status === "approved" ? "reject" : "approve"}
                          />
                        </div>
                        <DeleteButtonClient questionId={question.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>
        )}

        {/* Scroll indicators - show every 10 items */}
        {allQuestions.length > 10 && (
          <div className="sticky bottom-20 sm:bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10">
            <div className="pointer-events-auto">
              <a 
                href="#top"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <span className="text-sm font-medium">Back to Top</span>
              </a>
            </div>
          </div>
        )}
        </div>
      </>
    )
  
}
