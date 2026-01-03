"use client"

import { MobileCard } from "@/components/mobile-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PrimaryButton } from "@/components/primary-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TopicSelector } from "@/components/topic-selector"
import { DraftQuestionsList, FormatExampleCard } from "@/features/questions/import/components"
import { DraftQuestion } from "@/features/questions/import/types"

interface PasteTextModeProps {
  pastedText: string
  setPastedText: (value: string) => void
  editableDrafts: DraftQuestion[]
  showParsedQuestions: boolean
  batchTopic: string
  setBatchTopic: (value: string) => void
  batchDifficulty: "easy" | "medium" | "hard"
  setBatchDifficulty: (value: "easy" | "medium" | "hard") => void
  isSubmitting: boolean
  topics: any[]
  onParse: () => void
  onUpdateDraft: (index: number, updated: DraftQuestion) => void
  onDeleteDraft: (index: number) => void
  onSubmitBatch: () => void
  onBackToEdit: () => void
}

export function PasteTextMode({
  pastedText,
  setPastedText,
  editableDrafts,
  showParsedQuestions,
  batchTopic,
  setBatchTopic,
  batchDifficulty,
  setBatchDifficulty,
  isSubmitting,
  topics,
  onParse,
  onUpdateDraft,
  onDeleteDraft,
  onSubmitBatch,
  onBackToEdit,
}: PasteTextModeProps) {
  return (
    <div className="space-y-6">
      <MobileCard className="p-6 space-y-4">
        <Label htmlFor="paste-text" className="text-base font-semibold">Paste Question Text</Label>
        <Textarea
          id="paste-text"
          placeholder="Paste your questions here. Use format:&#10;Q: Question text&#10;A) Option A&#10;B) Option B&#10;C) Option C&#10;D) Option D&#10;Answer: A"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          rows={12}
          className="resize-none font-mono text-sm"
          disabled={showParsedQuestions}
        />
      </MobileCard>

      {!showParsedQuestions ? (
        <>
          <PrimaryButton 
            fullWidth 
            className="h-14 text-lg font-semibold"
            onClick={onParse}
            disabled={!pastedText.trim()}
          >
            Auto-Parse Questions
          </PrimaryButton>

          <FormatExampleCard />
        </>
      ) : (
        <>
          {/* Topic and Difficulty Selection */}
          <MobileCard className="p-4 sm:p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select Topic</Label>
              <TopicSelector 
                topics={topics}
                selectedTopicId={batchTopic}
                onSelectTopic={setBatchTopic}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-difficulty" className="text-sm font-semibold">Difficulty Level</Label>
              <Select value={batchDifficulty} onValueChange={(v) => setBatchDifficulty(v as "easy" | "medium" | "hard")}>
                <SelectTrigger id="batch-difficulty" className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 Easy</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="hard">🔴 Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </MobileCard>

          {/* Parsed Questions List */}
          <DraftQuestionsList
            questions={editableDrafts}
            onUpdate={onUpdateDraft}
            onDelete={onDeleteDraft}
          />

          {/* Submit Buttons */}
          <div className="space-y-3 pt-2 pb-20">
            <PrimaryButton
              fullWidth
              className="h-14 text-lg font-semibold"
              onClick={onSubmitBatch}
              disabled={isSubmitting || editableDrafts.length === 0 || !batchTopic}
            >
              {isSubmitting ? "Submitting..." : `Submit ${editableDrafts.length} Question${editableDrafts.length === 1 ? '' : 's'}`}
            </PrimaryButton>
            <button
              type="button"
              onClick={onBackToEdit}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Edit Text
            </button>
          </div>
        </>
      )}
    </div>
  )
}
