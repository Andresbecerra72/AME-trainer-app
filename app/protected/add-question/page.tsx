"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { SegmentedControl } from "@/components/segmented-control"
import { BottomNav } from "@/components/bottom-nav"
import { getSession } from "@/features/auth/services/getSession"
import { getTopics } from "@/lib/db-actions"
import { User, UserRole } from "@/lib/types"
import { useManualQuestion, useFileUpload, usePasteText } from "./hooks"
import { ManualMode, UploadFileMode, PasteTextMode } from "./components"

export default function AddQuestionPage() {
  const [mode, setMode] = useState("Manual")
  const [topics, setTopics] = useState<any[]>([])
  const [role, setRole] = useState<UserRole>()
  const [user, setUser] = useState<User>()

  // Mode-specific hooks
  const manualQuestion = useManualQuestion()
  const fileUpload = useFileUpload(user)
  const pasteText = usePasteText()

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
          <ManualMode
            {...manualQuestion}
            topics={topics}
            onSubmit={manualQuestion.handleSubmit}
          />
        )}

        {/* Upload File Mode */}
        {mode === "Upload File" && (
          <UploadFileMode
            user={user}
            {...fileUpload}
            topics={topics}
            isSubmitting={false}
            onFileUpload={fileUpload.handleFileUpload}
            onResumeJob={fileUpload.handleResumeJob}
            onDeleteJob={fileUpload.handleDeleteJob}
            onSubmitFileImport={fileUpload.handleSubmitFileImport}
          />
        )}

        {/* Paste Text Mode */}
        {mode === "Paste Text" && (
          <PasteTextMode
            {...pasteText}
            topics={topics}
            onParse={pasteText.handleParse}
            onUpdateDraft={pasteText.handleUpdateDraft}
            onDeleteDraft={pasteText.handleDeleteDraft}
            onSubmitBatch={pasteText.handleSubmitBatch}
            onBackToEdit={pasteText.handleBackToEdit}
          />
        )}
      </div>

      <BottomNav userRole={role} />
    </div>
  )
}
