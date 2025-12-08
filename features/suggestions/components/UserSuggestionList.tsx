"use client";

import { useMyEditSuggestions } from "../hooks/useMyEditSuggestions";
import { SuggestionCard } from "./SuggestionCard";

export function UserSuggestionList() {
  const { suggestions, loading, error, refresh } = useMyEditSuggestions();

  if (loading) return <p>Loading suggestions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (suggestions.length === 0) return <p>No suggestions submitted yet.</p>;

  return (
    <div className="space-y-4">
      {suggestions.map((s) => (
        <SuggestionCard key={s.id} suggestion={s} onRefresh={refresh} />
      ))}
    </div>
  );
}
