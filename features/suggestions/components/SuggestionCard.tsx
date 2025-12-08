"use client";

import { Button } from "@/components/ui/button";
import { useDeleteEditSuggestion } from "../hooks/useDeleteEditSuggestion";

export function SuggestionCard({ suggestion, onRefresh }: any) {
  const { removeSuggestion, success } = useDeleteEditSuggestion();

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white space-y-3">
      <h3 className="font-semibold">Suggestion for Question #{suggestion.question_id}</h3>
      <p className="text-sm text-gray-700">{suggestion.reason}</p>

      <div className="text-xs text-gray-500">
        Status:{" "}
        <span
          className={
            suggestion.status === "pending"
              ? "text-yellow-600"
              : suggestion.status === "approved"
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {suggestion.status}
        </span>
      </div>

      <Button
        variant="destructive"
        onClick={async () => {
          await removeSuggestion(suggestion.id);
          onRefresh?.();
        }}
      >
        Delete
      </Button>
    </div>
  );
}
