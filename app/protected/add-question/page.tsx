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
import { Upload, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { createQuestion, getTopics } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { UserRole } from "@/lib/types"

export default function AddQuestionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState("Manual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [topics, setTopics] = useState<any[]>([])
  const [role, setRole] = useState<UserRole>()

  const [question, setQuestion] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [explanation, setExplanation] = useState("")
  const [pastedText, setPastedText] = useState("")

  useEffect(() => {
    loadTopics()
    loadSession()
  }, [])

  const loadSession = async () => {
    const { role: userRole } = await getSession()
    setRole(userRole)
  }

  const loadTopics = async () => {
    const data = await getTopics()
    setTopics(data)
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
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Add Question" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Mode Selector */}
        <div className="flex justify-center">
          <SegmentedControl
            options={["Manual", "Upload File", "Paste Text"]}
            value={mode}
            onChange={setMode}
            className="w-full"
          />
        </div>

        {/* Manual Mode */}
        {mode === "Manual" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question Text</Label>
              <Textarea
                id="question"
                placeholder="Enter your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-4">
              <Label>Answer Options</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                    A
                  </div>
                  <Input placeholder="Option A" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                    B
                  </div>
                  <Input placeholder="Option B" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                    C
                  </div>
                  <Input placeholder="Option C" value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                    D
                  </div>
                  <Input placeholder="Option D" value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <RadioGroup
                value={correctAnswer}
                onValueChange={(value) => setCorrectAnswer(value as "A" | "B" | "C" | "D")}
              >
                <div className="flex gap-4">
                  {["A", "B", "C", "D"].map((letter) => (
                    <div key={letter} className="flex items-center space-x-2">
                      <RadioGroupItem value={letter} id={`answer-${letter}`} />
                      <Label htmlFor={`answer-${letter}`} className="cursor-pointer">
                        {letter}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                placeholder="Provide an explanation for the correct answer..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic} required>
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <PrimaryButton type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Add Question"}
            </PrimaryButton>
          </form>
        )}

        {/* Upload File Mode */}
        {mode === "Upload File" && (
          <div className="space-y-6">
            <MobileCard className="border-dashed border-2 p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Upload Question File</p>
                <p className="text-sm text-muted-foreground">PDF, DOC, or image files supported</p>
              </div>
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" id="file-upload" />
              <label htmlFor="file-upload">
                <PrimaryButton type="button" onClick={() => document.getElementById("file-upload")?.click()}>
                  Choose File
                </PrimaryButton>
              </label>
            </MobileCard>

            <MobileCard className="bg-muted/50">
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>OCR will extract text from your file.</p>
                  <p>Review and edit the parsed questions before adding.</p>
                </div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* Paste Text Mode */}
        {mode === "Paste Text" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="paste-text">Paste Question Text</Label>
              <Textarea
                id="paste-text"
                placeholder="Paste your questions here. Use format:&#10;Q: Question text&#10;A) Option A&#10;B) Option B&#10;C) Option C&#10;D) Option D&#10;Answer: A"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={12}
                className="resize-none font-mono text-sm"
              />
            </div>

            <PrimaryButton fullWidth>Auto-Parse Questions</PrimaryButton>

            <MobileCard className="bg-muted/50">
              <p className="text-sm text-muted-foreground">
                After parsing, you'll be able to review and edit each question before adding them to your bank.
              </p>
            </MobileCard>
          </div>
        )}
      </div>

      <BottomNav userRole={role}/>
    </div>
  )
}
