"use client";

import { useTopics } from "../hooks/useTopics";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function TopicSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { topics, loading } = useTopics();

  if (loading) return <p className="text-sm text-muted-foreground">Loading topics...</p>;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a topic" />
      </SelectTrigger>

      <SelectContent>
        {topics.map((topic) => (
          <SelectItem key={topic.id} value={topic.id}>
            {topic.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
