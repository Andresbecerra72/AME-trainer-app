"use client";

import { useEffect, useState } from "react";
import { getMyEditSuggestions } from "../services/suggestions.api";

export function useMyEditSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyEditSuggestions();
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message || "Error loading suggestions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { suggestions, loading, error, refresh: load };
}
