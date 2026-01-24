"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Filter, Search } from "lucide-react";
import { useState, useTransition, useEffect } from "react";

const DIFFICULTIES = ["easy", "medium", "hard"];
const STATUSES = ["pending", "approved", "rejected"];

interface Topic {
  id: string;
  name: string;
  code: string;
}

interface AdminQuestionFiltersProps {
  topics: Topic[];
}

export function AdminQuestionFilters({ topics }: AdminQuestionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Local state for search input (debounced)
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Navigate with new params (triggers new query)
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    setSearchValue("");
    startTransition(() => {
      router.push("/admin/questions", { scroll: false });
    });
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== searchParams.get("search")) {
        updateFilter("search", searchValue || null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const activeFilterCount = Array.from(searchParams.keys()).length;

  return (
    <div className="space-y-3">
      {/* Search Bar - Always visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search questions..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 h-12"
          disabled={isPending}
        />
      </div>

      {/* Status Quick Filters - Always visible */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={!searchParams.get("status") ? "default" : "outline"} 
          size="sm" 
          onClick={() => updateFilter("status", null)}
          disabled={isPending}
        >
          All
        </Button>
        {STATUSES.map((status) => (
          <Button 
            key={status}
            variant={searchParams.get("status") === status ? "default" : "outline"} 
            size="sm" 
            onClick={() => updateFilter("status", status)}
            disabled={isPending}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Toggle Advanced Filters */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        {isExpanded ? "Hide" : "Show"} Advanced Filters
        {activeFilterCount > 1 && (
          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-primary-foreground bg-primary rounded-full">
            {activeFilterCount - 1}
          </span>
        )}
      </Button>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={searchParams.get("difficulty") || "all"}
              onValueChange={(value) =>
                updateFilter("difficulty", value === "all" ? null : value)
              }
              disabled={isPending}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="All difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All difficulties</SelectItem>
                {DIFFICULTIES.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topicId">Topic</Label>
            <Select
              value={searchParams.get("topicId") || "all"}
              onValueChange={(value) =>
                updateFilter("topicId", value === "all" ? null : value)
              }
              disabled={isPending}
            >
              <SelectTrigger id="topicId">
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.code} - {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={isPending || activeFilterCount === 0}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {isPending && (
            <p className="text-xs text-muted-foreground text-center">
              Updating filters...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
