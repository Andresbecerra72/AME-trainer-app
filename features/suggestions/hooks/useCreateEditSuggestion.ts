"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { EditSuggestionSchema } from "../utils/suggestions.validations";
import { createEditSuggestion } from "../services/suggestions.api";

export function useCreateEditSuggestion() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  function submitSuggestion(formData: z.infer<typeof EditSuggestionSchema>) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const validated = EditSuggestionSchema.parse(formData);

        await createEditSuggestion(validated);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Error submitting suggestion");
      }
    });
  }

  return {
    submitSuggestion,
    error,
    success,
    isPending,
  };
}
