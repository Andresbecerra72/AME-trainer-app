"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { PrimaryButton } from "@/components/primary-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

interface Topic {
  id: string
  name: string
  question_count: number
}

interface ExamSetupClientProps {
  topics: Topic[]
}

export function ExamSetupClient({ topics }: ExamSetupClientProps) {
  const router = useRouter()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState("20")
  const [timerEnabled, setTimerEnabled] = useState(true)

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => (prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]))
  }

  const handleStartExam = () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic")
      return
    }
    const params = new URLSearchParams()
    params.set("topics", selectedTopics.join(","))
    params.set("count", questionCount)
    params.set("timer", timerEnabled.toString())
    console.log("Starting exam with params:", params.toString())
    router.push(`/exam/run?${params.toString()}`)
    //router.push("/exam/run")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Exam Setup" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Select Topics */}
        <div className="space-y-4">
          <Label className="text-base">Select Topics</Label>
          <MobileCard className="space-y-3">
            {topics.map((topic, index) => (
              <div key={topic.id}>
                {index > 0 && <div className="h-px bg-border -mx-4" />}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      id={topic.id}
                      checked={selectedTopics.includes(topic.id)}
                      onCheckedChange={() => toggleTopic(topic.id)}
                    />
                    <Label htmlFor={topic.id} className="text-sm font-medium cursor-pointer flex-1">
                      {topic.name}
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">{topic.question_count} Q's</span>
                </div>
              </div>
            ))}
          </MobileCard>
          {selectedTopics.length > 0 && (
            <p className="text-sm text-muted-foreground px-1">
              {selectedTopics.length} topic{selectedTopics.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* Number of Questions */}
        <div className="space-y-2">
          <Label htmlFor="question-count">Number of Questions</Label>
          <Input
            id="question-count"
            type="number"
            min="5"
            max="100"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground px-1">Choose between 5 and 100 questions</p>
        </div>

        {/* Timer Toggle */}
        <MobileCard>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="timer" className="text-base cursor-pointer">
                Enable Timer
              </Label>
              <p className="text-sm text-muted-foreground">
                {timerEnabled ? "1 minute per question" : "No time limit"}
              </p>
            </div>
            <Switch id="timer" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
          </div>
        </MobileCard>

        {/* Exam Info */}
        <MobileCard className="bg-primary/5 border-primary/20">
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-foreground">Exam Summary</h3>
            <div className="space-y-1 text-muted-foreground">
              <p>• {questionCount} questions</p>
              <p>• {timerEnabled ? `${questionCount} minutes` : "Untimed"}</p>
              <p>
                • {selectedTopics.length || "No"} topic{selectedTopics.length !== 1 ? "s" : ""} covered
              </p>
            </div>
          </div>
        </MobileCard>

        {/* Start Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
          <div className="max-w-2xl mx-auto">
            <PrimaryButton onClick={handleStartExam} fullWidth disabled={selectedTopics.length === 0}>
              Start Exam
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
