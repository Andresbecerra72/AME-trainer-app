"use client";

import { useState } from "react";
import { useCreateEditSuggestion } from "../hooks/useCreateEditSuggestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function EditSuggestionForm({ questionId }: { questionId: string }) {
  const { submitSuggestion, error, success, isPending } = useCreateEditSuggestion();

  const [form, setForm] = useState({
    question_id: questionId,
    proposed_question_text: "",
    proposed_answers: ["", "", "", ""],
    proposed_correct_index: 0,
    reason: "",
  });

  function handleChangeAnswer(index: number, value: string) {
    setForm({
      ...form,
      proposed_answers: form.proposed_answers.map((ans, i) =>
        i === index ? value : ans
      ),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitSuggestion(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg shadow">
      <div>
        <Label>Proposed Question Text</Label>
        <Textarea
          value={form.proposed_question_text}
          onChange={(e) =>
            setForm({ ...form, proposed_question_text: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Label>Proposed Answers</Label>

        {form.proposed_answers.map((ans, i) => (
          <Input
            key={i}
            placeholder={`Answer ${i + 1}`}
            value={ans}
            onChange={(e) => handleChangeAnswer(i, e.target.value)}
          />
        ))}
      </div>

      <div>
        <Label>Correct Answer Index (0-3)</Label>
        <Input
          type="number"
          value={form.proposed_correct_index}
          onChange={(e) =>
            setForm({ ...form, proposed_correct_index: Number(e.target.value) })
          }
        />
      </div>

      <div>
        <Label>Reason for Suggestion</Label>
        <Textarea
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Suggestion submitted!</p>}

      <Button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Suggestion"}
      </Button>
    </form>
  );
}
