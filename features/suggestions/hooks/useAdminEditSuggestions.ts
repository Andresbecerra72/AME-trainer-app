"use client";

import { useEffect, useState } from "react";
import { getAllEditSuggestions } from "../services/suggestions.api";

export function useAdminEditSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllEditSuggestions();
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message || "Unauthorized or failed request");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { suggestions, loading, error, refresh: load };
}
