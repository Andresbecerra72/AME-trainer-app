"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { ReviewSchema } from "../utils/suggestions.validations";
import { reviewEditSuggestion } from "../services/suggestions.api";

export function useReviewEditSuggestion() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  function submitReview(formData: z.infer<typeof ReviewSchema>) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const validated = ReviewSchema.parse(formData);

        await reviewEditSuggestion(validated);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to review suggestion");
      }
    });
  }

  return {
    submitReview,
    error,
    success,
    isPending,
  };
}
