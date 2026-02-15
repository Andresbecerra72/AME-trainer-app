"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getExamLikelihood } from "../types"
import { getSignalCount, hasUserSignaled, toggleUserSignal } from "../server/examSignals.actions"

interface UseExamSignalsOptions {
  initialCount?: number
  initialActive?: boolean
}

export function useExamSignals(questionId: string, options?: UseExamSignalsOptions) {
  const [count, setCount] = useState<number>(options?.initialCount ?? 0)
  const [active, setActive] = useState<boolean>(options?.initialActive ?? false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const hasInitial = typeof options?.initialCount === "number" && typeof options?.initialActive === "boolean"
    if (hasInitial) return

    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      try {
        const [nextCount, nextActive] = await Promise.all([
          getSignalCount(questionId),
          hasUserSignaled(questionId),
        ])

        if (!isMounted) return
        setCount(nextCount)
        setActive(nextActive)
      } catch (error) {
        if (!isMounted) return
        toast({
          title: "Error",
          description: "Failed to load exam signals.",
          variant: "destructive",
        })
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [options?.initialActive, options?.initialCount, questionId, toast])

  const toggle = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await toggleUserSignal(questionId)
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
