"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface DuplicateCheckProps {
  questionText: string
}

export function DuplicateCheck({ questionText }: DuplicateCheckProps) {
  const [checking, setChecking] = useState(false)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [checked, setChecked] = useState(false)

  async function checkForDuplicates() {
    setChecking(true)
    try {
      const response = await fetch("/api/check-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText }),
      })
      const data = await response.json()
      setDuplicates(data.duplicates || [])
      setChecked(true)
    } catch (error) {
      console.error("Error checking duplicates:", error)
    } finally {
      setChecking(false)
    }
  }

  if (!questionText || questionText.length < 20) return null

  return (
    <Card className="p-4 space-y-3 border-yellow-200 dark:border-yellow-900">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <p className="text-sm font-medium">AI Duplicate Detection</p>
      </div>

      {!checked ? (
        <>
          <p className="text-xs text-muted-foreground">
            Check if similar questions already exist in the database before submitting.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={checkForDuplicates}
            disabled={checking}
            className="w-full bg-transparent"
          >
            {checking ? "Checking..." : "Check for Duplicates"}
          </Button>
        </>
      ) : duplicates.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <p className="text-sm">No similar questions found. You're good to go!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{duplicates.length} similar question(s) found:</p>
          {duplicates.map((dup: any) => (
            <Card key={dup.id} className="p-3 bg-muted/50">
              <p className="text-sm line-clamp-2 mb-2">{dup.question_text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{dup.similarity}% similar</span>
                <Link href={`/community/questions/${dup.id}`} target="_blank">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View Question
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
