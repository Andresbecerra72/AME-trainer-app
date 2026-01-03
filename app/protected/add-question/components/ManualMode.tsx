"use client"

import { MobileCard } from "@/components/mobile-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PrimaryButton } from "@/components/primary-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TopicSelector } from "@/components/topic-selector"

interface ManualModeProps {
  question: string
  setQuestion: (value: string) => void
  optionA: string
  setOptionA: (value: string) => void
  optionB: string
  setOptionB: (value: string) => void
  optionC: string
  setOptionC: (value: string) => void
  optionD: string
  setOptionD: (value: string) => void
  correctAnswer: "A" | "B" | "C" | "D"
  setCorrectAnswer: (value: "A" | "B" | "C" | "D") => void
  selectedTopic: string
  setSelectedTopic: (value: string) => void
  difficulty: string
  setDifficulty: (value: string) => void
  explanation: string
  setExplanation: (value: string) => void
  topics: any[]
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function ManualMode({
  question,
  setQuestion,
  optionA,
  setOptionA,
  optionB,
  setOptionB,
  optionC,
  setOptionC,
  optionD,
  setOptionD,
  correctAnswer,
  setCorrectAnswer,
  selectedTopic,
  setSelectedTopic,
  difficulty,
  setDifficulty,
  explanation,
  setExplanation,
  topics,
  isSubmitting,
  onSubmit,
}: ManualModeProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <MobileCard className="p-4 sm:p-5 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="question" className="text-sm font-semibold">Question Text</Label>
          <Textarea
            id="question"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Answer Options</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { letter: "A", value: optionA, onChange: setOptionA },
              { letter: "B", value: optionB, onChange: setOptionB },
              { letter: "C", value: optionC, onChange: setOptionC },
              { letter: "D", value: optionD, onChange: setOptionD },
            ].map(({ letter, value, onChange }) => (
              <div key={letter} className="flex gap-2 items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-base text-primary flex-shrink-0">
                  {letter}
                </div>
                <Input
                  placeholder={`Option ${letter}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  required
                  className="text-sm h-10"
                />
              </div>
            ))}
          </div>
        </div>
      </MobileCard>

      <MobileCard className="p-4 sm:p-5 space-y-3 bg-muted/30">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Correct Answer</Label>
          <RadioGroup
            value={correctAnswer}
            onValueChange={(value) => setCorrectAnswer(value as "A" | "B" | "C" | "D")}
          >
            <div className="grid grid-cols-4 gap-2">
              {["A", "B", "C", "D"].map((letter) => (
                <label
                  key={letter}
                  htmlFor={`answer-${letter}`}
                  className={`flex items-center justify-center space-x-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    correctAnswer === letter
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={letter} id={`answer-${letter}`} />
                  <span className="font-semibold text-base">{letter}</span>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="explanation" className="text-sm font-semibold">
            Explanation <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="explanation"
            placeholder="Provide an explanation for the correct answer..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
        </div>
      </MobileCard>

      <MobileCard className="p-4 sm:p-5 space-y-4">
        <TopicSelector 
          topics={topics}
          selectedTopicId={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />
      </MobileCard>

      <MobileCard className="p-4 sm:p-5 space-y-2">
        <Label htmlFor="difficulty" className="text-sm font-semibold">Difficulty Level</Label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger id="difficulty" className="h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">🟢 Easy</SelectItem>
            <SelectItem value="medium">🟡 Medium</SelectItem>
            <SelectItem value="hard">🔴 Hard</SelectItem>
          </SelectContent>
        </Select>
      </MobileCard>

      <div className="pt-2 pb-20">
        <PrimaryButton type="submit" fullWidth disabled={isSubmitting} className="h-12 text-base font-semibold">
          {isSubmitting ? "Submitting..." : "Add Question"}
        </PrimaryButton>
      </div>
    </form>
  )
}
