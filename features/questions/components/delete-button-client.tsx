"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { deleteQuestionAction } from "@/features/questions/services/question.server"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type DeleteButtonClientProps = {
  questionId: string
}

export function DeleteButtonClient({ questionId }: DeleteButtonClientProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteQuestionAction(questionId)
        
        toast({
          title: "Success",
          description: "Question deleted successfully",
        })
        
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete question",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 min-w-[100px] bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-600"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3 mr-1" />
        )}
        Delete
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone and will permanently remove the question from the database."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  )
}
