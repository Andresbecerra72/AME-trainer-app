"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { rateExam } from "@/lib/db-actions"
import { useToast } from "@/hooks/use-toast"

export function RateExamForm({ examId, userId }: { examId: string; userId: string }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const result = await rateExam(examId, userId, rating, comment || null)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Thank you!",
        description: "Your rating has been submitted",
      })
      setRating(0)
      setComment("")
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit rating",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold">Rate This Exam</h3>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                value <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating} stars</span>}
      </div>

      <Textarea
        placeholder="Share your thoughts about this exam (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />

      <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </Card>
  )
}
