"use client";

import { useEffect, useState } from "react";
import { getAllTopicsClient } from "../services/topic.api";

export function useTopics() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTopicsClient()
      .then((t) => setTopics(t))
      .finally(() => setLoading(false));
  }, []);

  return { topics, loading };
}
