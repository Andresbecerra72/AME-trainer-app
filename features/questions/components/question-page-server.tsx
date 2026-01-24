/**
 * Questions Page - Server Component Entry Point
 * 
 * This is the main page component that Next.js App Router loads.
 * Delegates to client component for interactivity.
 */

import { Suspense } from "react";
import { QuestionsPageClient } from "./questions-page-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Questions - AME Exam Trainer",
  description: "Browse and practice AME exam questions",
};

function QuestionsLoadingFallback() {
  return (
    <div className="container py-8 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<QuestionsLoadingFallback />}>
      <QuestionsPageClient />
    </Suspense>
  );
}
