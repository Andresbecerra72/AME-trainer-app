"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReviewEditSuggestion } from "../hooks/useReviewEditSuggestion";

export function ReviewDialog({ suggestion, onRefresh }: any) {
  const { submitReview, error, success, isPending } = useReviewEditSuggestion();

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const handleReview = (status: "approved" | "rejected") => {
    submitReview({
      id: suggestion.id,
      status,
      reviewer_notes: notes,
    });

    onRefresh?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Review</Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <h2 className="text-lg font-semibold">Review Suggestion</h2>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Reviewer notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Saved!</p>}

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => handleReview("rejected")}
          >
            Reject
          </Button>

          <Button
            disabled={isPending}
            onClick={() => handleReview("approved")}
          >
            Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
