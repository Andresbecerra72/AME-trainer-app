/**
 * Question Filters Component
 * 
 * URL-driven filters that sync with searchParams
 * All filter state lives in URL for:
 * - Shareable URLs
 * - Browser back/forward support
 * - Stable cache keys
 */

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
import { X, Filter } from "lucide-react";
import { useQuestionUIStore } from "@/stores/question-ui-store";
import { useState, useTransition } from "react";

const DIFFICULTIES = ["easy", "medium", "hard"];
const STATUSES = ["pending", "approved", "rejected"];

export function QuestionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const { isFilterPanelOpen, toggleFilterPanel } = useQuestionUIStore();
  
  // Local state for search input (debounced)
  const [searchValue, setSearchValue] = useState(
    searchParams.get("searchTerm") || ""
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
      router.push("?", { scroll: false });
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    // Debounced update
    const timer = setTimeout(() => {
      updateFilter("searchTerm", value || null);
    }, 500);

    return () => clearTimeout(timer);
  };

  const activeFilterCount = Array.from(searchParams.keys()).length;

  if (!isFilterPanelOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleFilterPanel}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-primary-foreground bg-primary rounded-full">
            {activeFilterCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFilterPanel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search questions..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={isPending}
        />
      </div>

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

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={searchParams.get("status") || "approved"}
          onValueChange={(value) => updateFilter("status", value)}
          disabled={isPending}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Module */}
      <div className="space-y-2">
        <Label htmlFor="module">Module</Label>
        <Input
          id="module"
          placeholder="e.g., M1, M2..."
          value={searchParams.get("module") || ""}
          onChange={(e) => updateFilter("module", e.target.value || null)}
          disabled={isPending}
        />
      </div>

      {/* Topic ID */}
      <div className="space-y-2">
        <Label htmlFor="topicId">Topic ID</Label>
        <Input
          id="topicId"
          placeholder="Topic UUID..."
          value={searchParams.get("topicId") || ""}
          onChange={(e) => updateFilter("topicId", e.target.value || null)}
          disabled={isPending}
        />
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
      </div>

      {isPending && (
        <p className="text-xs text-muted-foreground text-center">
          Updating filters...
        </p>
      )}
    </div>
  );
}
