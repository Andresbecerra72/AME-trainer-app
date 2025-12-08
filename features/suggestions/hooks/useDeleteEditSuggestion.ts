"use client";

import { useState, useTransition } from "react";
import { deleteEditSuggestion } from "../services/suggestions.api";

export function useDeleteEditSuggestion() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  function removeSuggestion(id: string) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await deleteEditSuggestion(id);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to delete suggestion");
      }
    });
  }

  return {
    removeSuggestion,
    error,
    success,
    isPending,
  };
}
