/**
 * TanStack Query Configuration
 * 
 * Global QueryClient setup with optimized defaults
 * for the AME Trainer application.
 */

import { QueryClient, DefaultOptions } from "@tanstack/react-query";

/**
 * Default query options optimized for:
 * - Reduced refetching (data is relatively stable)
 * - Longer cache times (questions don't change frequently)
 * - Smart retry logic
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes before considering it stale
    staleTime: 5 * 60 * 1000,

    // Keep unused data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,

    // Don't refetch on window focus (questions are stable)
    refetchOnWindowFocus: false,

    // Retry failed requests with exponential backoff
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Disable automatic background refetching
    refetchOnMount: false,
    refetchOnReconnect: "always",
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
  },
};

/**
 * Create QueryClient instance
 * Use this factory in both client and server components
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

/**
 * Browser-only QueryClient singleton
 * Prevents creating multiple instances during development
 */
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse existing client or create new one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
