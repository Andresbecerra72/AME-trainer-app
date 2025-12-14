"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ReportDialogProps {
  reportAction: (formData: FormData) => Promise<void>
  hasReported?: boolean
}

export function ReportDialog({ reportAction, hasReported }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await reportAction(formData)
        toast({
          title: "Report submitted",
          description: "Thank you for helping us maintain quality.",
        })
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit report. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={hasReported ? "border-orange-500 text-orange-600" : ""}
        >
          <Flag className={`h-4 w-4 ${hasReported ? "fill-current" : ""}`} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Question</DialogTitle>
          <DialogDescription>
            Help us maintain quality by reporting issues with this question.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <select 
              id="reason" 
              name="reason" 
              className="w-full p-2 border rounded-md bg-background" 
              required
              disabled={isPending}
            >
              <option value="">Select a reason</option>
              <option value="incorrect">Incorrect Answer</option>
              <option value="duplicate">Duplicate Question</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide additional details..."
              rows={3}
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
