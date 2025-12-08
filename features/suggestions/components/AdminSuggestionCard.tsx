"use client";

import { ReviewDialog } from "./ReviewDialog";

export function AdminSuggestionCard({ suggestion, onRefresh }: any) {
  return (
    <div className="border p-4 rounded-lg shadow space-y-4 bg-white">
      <h3 className="font-semibold">User: {suggestion.user?.full_name}</h3>

      <div>
        <p className="font-medium">Reason:</p>
        <p className="text-gray-700">{suggestion.reason}</p>
      </div>

      <div>
        <p className="text-sm">Status: {suggestion.status}</p>
      </div>

      <ReviewDialog suggestion={suggestion} onRefresh={onRefresh} />
    </div>
  );
}
