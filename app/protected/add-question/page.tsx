"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { SegmentedControl } from "@/components/segmented-control"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PrimaryButton } from "@/components/primary-button"
import { Upload, FileText, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TopicSelector } from "@/components/topic-selector"
import { useRouter } from "next/navigation"
import { createQuestion, getTopics } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { User, UserRole } from "@/lib/types"
import { useQuestionImport } from "@/features/questions/import/hooks/useQuestionImport"
import { DraftQuestionsList, FormatExampleCard, FileUploadStatusCard, FileImportReviewCard } from "@/features/questions/import/components"
import { DraftQuestion } from "@/features/questions/import/types"
import { useQuestionImportJob } from "@/features/questions/import/hooks/useQuestionImportJob"
import { useUser } from "@/features/auth/components/UserProvider"
import { createQuestionsBatch } from "@/features/questions/import/server/questionImport.actions"

export default function AddQuestionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState("Manual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [topics, setTopics] = useState<any[]>([])
  const [role, setRole] = useState<UserRole>()
  const [user, setUser] = useState<User>()

  const [question, setQuestion] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [explanation, setExplanation] = useState("")
  const { pastedText, setPastedText, drafts, submitPaste, isSubmitting: isImportSubmitting } = useQuestionImport()
  
  // State for managing parsed drafts
  const [editableDrafts, setEditableDrafts] = useState<DraftQuestion[]>([])
  const [showParsedQuestions, setShowParsedQuestions] = useState(false)
  const [batchTopic, setBatchTopic] = useState("")
  const [batchDifficulty, setBatchDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const { job, isUploading, isExtracting, extractionProgress, error, startUpload } = useQuestionImportJob()

  useEffect(() => {
    loadTopics()
    loadSession()
  }, [])

  const loadSession = async () => {
    const { role: userRole, profile: userProfile } = await getSession()
    setUser(userProfile)
    setRole(userRole)
  }

  const loadTopics = async () => {
    const data = await getTopics()
    setTopics(data)
  }

  const handleParse = () => {
    console.log("Parsed drafts:", drafts)

    if (drafts.length === 0) {
      toast({
        title: "No questions found",
        description: "Please check your text format and try again.",
        variant: "destructive",
      })
      return
    }
    setEditableDrafts(drafts)
    setShowParsedQuestions(true)
    toast({
      title: "Questions parsed",
      description: `Found ${drafts.length} question${drafts.length === 1 ? '' : 's'}. Review and submit when ready.`,
    })
  }

  const handleUpdateDraft = (index: number, updated: DraftQuestion) => {
    const newDrafts = [...editableDrafts]
    newDrafts[index] = updated
    setEditableDrafts(newDrafts)
  }

  const handleDeleteDraft = (index: number) => {
    const newDrafts = editableDrafts.filter((_, i) => i !== index)
    setEditableDrafts(newDrafts)
    toast({
      title: "Question removed",
      description: "The question has been removed from the batch.",
    })
  }

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Session Error",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      })
      return
    }

    try {
      await startUpload(file)
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitBatch = async () => {
    if (!batchTopic) {
      toast({
        title: "Topic required",
        description: "Please select a topic for these questions.",
        variant: "destructive",
      })
      return
    }

    if (editableDrafts.length === 0) {
      toast({
        title: "No questions to submit",
        description: "Please parse some questions first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Use editableDrafts directly since they may have been modified
      const result = await submitPaste({
        topic_id: batchTopic,
        difficulty: batchDifficulty,
        questions: editableDrafts, // Pass the edited drafts
      })

      toast({
        title: "Success",
        description: `${result.inserted} question${result.inserted === 1 ? '' : 's'} submitted for review.`,
      })

      // Reset state
      setPastedText("")
      setEditableDrafts([])
      setShowParsedQuestions(false)
      setBatchTopic("")
      setBatchDifficulty("medium")
      
      router.push("/protected/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit questions. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitFileImport = async (payload: {
    topic_id: string
    difficulty: "easy" | "medium" | "hard"
    questions: DraftQuestion[]
  }) => {
    try {
      const result = await createQuestionsBatch(payload)
      
      toast({
        title: "Success",
        description: `${result.inserted} question${result.inserted === 1 ? '' : 's'} from file submitted for review.`,
      })

      router.push("/protected/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit questions from file.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createQuestion({
        question_text: question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer,
        explanation: explanation || undefined,
        topic_id: selectedTopic,
        difficulty,
      })

      toast({
        title: "Success",
        description: "Question submitted for review",
      })

      router.push("/protected/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Add Question" showBack />

      <div className="p-4 sm:p-6 pb-24 md:pb-6 space-y-4 max-w-4xl mx-auto">
        {/* Mode Selector */}
        <div className="flex justify-center mb-4">
          <SegmentedControl
            options={["Manual", "Upload File", "Paste Text"]}
            value={mode}
            onChange={setMode}
            className="w-full max-w-md"
          />
        </div>

        {/* Manual Mode */}
        {mode === "Manual" && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex gap-2 items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-base text-primary flex-shrink-0">
                      A
                    </div>
                    <Input placeholder="Option A" value={optionA} onChange={(e) => setOptionA(e.target.value)} required className="text-sm h-10" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-base text-primary flex-shrink-0">
                      B
                    </div>
                    <Input placeholder="Option B" value={optionB} onChange={(e) => setOptionB(e.target.value)} required className="text-sm h-10" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-base text-primary flex-shrink-0">
                      C
                    </div>
                    <Input placeholder="Option C" value={optionC} onChange={(e) => setOptionC(e.target.value)} required className="text-sm h-10" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-base text-primary flex-shrink-0">
                      D
                    </div>
                    <Input placeholder="Option D" value={optionD} onChange={(e) => setOptionD(e.target.value)} required className="text-sm h-10" />
                  </div>
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
                <Label htmlFor="explanation" className="text-sm font-semibold">Explanation <span className="text-muted-foreground font-normal">(Optional)</span></Label>
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
        )}

        {/* Upload File Mode */}
        {mode === "Upload File" && (
          <div className="space-y-6">
            {/* Upload Area - Only show if no job or job failed */}
            {(!job || job.status === "failed") && (
              <>
                {!user?.id && (
                  <MobileCard className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 mb-4">
                    <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p>Loading user session...</p>
                    </div>
                  </MobileCard>
                )}
                <MobileCard className="border-dashed border-2 p-12 text-center space-y-6 hover:border-primary/50 transition-colors">
                  <div className="flex justify-center">
                    <div className="p-6 bg-primary/10 rounded-2xl">
                      <Upload className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">Upload Question File</p>
                    <p className="text-base text-muted-foreground">PDF or image files supported</p>
                  </div>
                  <input 
                    type="file" 
                    accept="application/pdf,image/*" 
                    className="hidden" 
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                      // Reset input to allow same file selection again
                      e.target.value = ''
                    }}
                    disabled={!user?.id || isUploading || isExtracting}
                  />
                  <label htmlFor="file-upload">
                    <PrimaryButton 
                      type="button" 
                      onClick={() => document.getElementById("file-upload")?.click()} 
                      className="h-12 px-8 text-base"
                      disabled={!user?.id || isUploading || isExtracting}
                    >
                      {isExtracting ? "Extracting..." : isUploading ? "Uploading..." : "Choose File"}
                    </PrimaryButton>
                  </label>
                </MobileCard>

                <MobileCard className="bg-muted/30 p-6">
                  <div className="flex gap-4">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="text-base text-muted-foreground space-y-2">
                      <p className="font-medium text-foreground">How it works:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Upload your PDF or image file</li>
                        <li>Text extraction happens in your browser (fast & private)</li>
                        <li>AI parses questions from the extracted text</li>
                        <li>Review and edit before submitting</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        <strong>Supported formats:</strong> PDF (text-based), JPG, PNG
                      </p>
                    </div>
                  </div>
                </MobileCard>
              </>
            )}

            {/* Status Card */}
            <FileUploadStatusCard 
              job={job} 
              isUploading={isUploading} 
              isExtracting={isExtracting}
              extractionProgress={extractionProgress}
              error={error} 
            />

            {/* Review Card - Only show when ready */}
            {job?.status === "ready" && job.result && job.result.length > 0 && (
              <FileImportReviewCard
                questions={job.result}
                topics={topics}
                onSubmit={handleSubmitFileImport}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}

        {/* Paste Text Mode */}
        {mode === "Paste Text" && (
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
                  onClick={handleParse}
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
                  onUpdate={handleUpdateDraft}
                  onDelete={handleDeleteDraft}
                />

                {/* Submit Buttons */}
                <div className="space-y-3 pt-2 pb-20">
                  <PrimaryButton
                    fullWidth
                    className="h-14 text-lg font-semibold"
                    onClick={handleSubmitBatch}
                    disabled={isImportSubmitting || editableDrafts.length === 0 || !batchTopic}
                  >
                    {isImportSubmitting ? "Submitting..." : `Submit ${editableDrafts.length} Question${editableDrafts.length === 1 ? '' : 's'}`}
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => {
                      setShowParsedQuestions(false)
                      setEditableDrafts([])
                    }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Edit Text
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav userRole={role}/>
    </div>
  )
}
