"use client"

import { useCallback, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getExamLikelihood } from "../types"
import { toggleUserSignal } from "../server/examSignals.actions"

interface UseExamSignalsOptions {
  initialCount?: number
  initialActive?: boolean
}

export interface ExamSignalPayload {
  examCode?: string | null
  seenMonth?: string | null
  seenYear?: number | null
  confidence?: number | null
}

export function useExamSignals(questionId: string, options?: UseExamSignalsOptions) {
  const [count, setCount] = useState<number>(options?.initialCount ?? 0)
  const [active, setActive] = useState<boolean>(options?.initialActive ?? false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggle = useCallback(async (payload?: ExamSignalPayload) => {
    setIsLoading(true)
    try {
      const result = await toggleUserSignal(questionId, payload)
      setActive(result.active)
      setCount(result.count)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam signal.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [questionId, toast])

  const likelihood = useMemo(() => getExamLikelihood(count), [count])

  return { count, likelihood, active, isLoading, toggle }
}
