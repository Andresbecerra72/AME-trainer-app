/**
 * TanStack Query Hooks for Questions
 * 
 * Provides:
 * - useInfiniteQuestions: Infinite scroll with cursor pagination
 * - useQuestion: Single question query
 * - usePrefetchNextPage: Prefetch optimization
 */

"use client";

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  Question,
  QuestionFilters,
  PaginatedQuestionsResponse,
} from "@/lib/types/questions";

/**
 * Query key factory for consistent cache management
 * 
 * Pattern: ['questions', ...filters]
 * This ensures proper cache invalidation and deduplication
 */
export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (filters: QuestionFilters) =>
    [...questionKeys.lists(), filters] as const,
  details: () => [...questionKeys.all, "detail"] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
};

/**
 * Fetch questions from API
 */
async function fetchQuestions(
  filters: QuestionFilters,
  cursor?: string,
  limit = 20
): Promise<PaginatedQuestionsResponse> {
  const params = new URLSearchParams();

  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit.toString());

  // Add filters to query params
  if (filters.topicId) params.append("topicId", filters.topicId);
  if (filters.module) params.append("module", filters.module);
  if (filters.difficulty) params.append("difficulty", filters.difficulty);
  if (filters.status) params.append("status", filters.status);
  if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
  if (filters.createdBy) params.append("createdBy", filters.createdBy);

  const response = await fetch(`/api/questions?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Infinite query hook for questions
 * 
 * Features:
 * - Cursor-based pagination
 * - Automatic query key generation from filters
 * - Prefetch next page support
 * - Optimistic updates
 */
export function useInfiniteQuestions(
  filters: QuestionFilters = {},
  limit = 20
) {
  const result = useInfiniteQuery({
    queryKey: questionKeys.list(filters),
    queryFn: ({ pageParam }) => fetchQuestions(filters, pageParam, limit),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Flatten all pages into a single array for easier consumption
  const allQuestions =
    result.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...result,
    allQuestions,
  };
}

/**
 * Prefetch next page
 * 
 * Call this hook to prefetch the next page before user scrolls
 * Improves perceived performance
 */
export function usePrefetchNextPage(
  filters: QuestionFilters,
  nextCursor?: string,
  limit = 20
) {
  const queryClient = useQueryClient();

  return () => {
    if (!nextCursor) return;

    queryClient.prefetchInfiniteQuery({
      queryKey: questionKeys.list(filters),
      queryFn: () => fetchQuestions(filters, nextCursor, limit),
      initialPageParam: nextCursor,
    });
  };
}

/**
 * Single question query
 */
async function fetchQuestion(id: string): Promise<Question> {
  const response = await fetch(`/api/questions/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch question: ${response.statusText}`);
  }

  return response.json();
}

export function useQuestion(
  id: string | null
): UseQueryResult<Question, Error> {
  return useQuery({
    queryKey: questionKeys.detail(id || ""),
    queryFn: () => fetchQuestion(id!),
    enabled: !!id, // Only run query if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes (questions rarely change)
  });
}

/**
 * Helper to get total count from infinite query
 */
export function useTotalQuestionCount(filters: QuestionFilters) {
  const result = useInfiniteQuestions(filters, 1);
  return result.data?.pages[0]?.total ?? 0;
}
