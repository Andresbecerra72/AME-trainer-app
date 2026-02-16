"use client"

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useExamSignals } from "../hooks/useExamSignals"

interface ExamSignalControlsProps {
  questionId: string
  initialCount?: number
  initialActive?: boolean
  initialExamCode?: string
  initialConfidence?: number
  className?: string
}

const likelihoodLabels: Record<string, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
}

const RATINGS = [
  { id: "M", label: "M Rating", description: "Mechanical" },
  { id: "E", label: "E Rating", description: "Electrical/Avionics" },
  { id: "S", label: "S Rating", description: "Structures" },
  { id: "REGS", label: "CARs/STDs", description: "Regulations/Standards" },
]

const CATEGORIES: Record<string, { id: string; label: string; prefix: string }[]> = {
  M: [
    { id: "SPM", label: "Standard Practices", prefix: "M-SPM" },
    { id: "AF", label: "Airframe", prefix: "M-AF" },
    { id: "PP", label: "Powerplant", prefix: "M-PP" },
  ],
  E: [
    { id: "SPE", label: "Standard Practices Avionics", prefix: "E-SPE" },
    { id: "AV", label: "Avionics", prefix: "E-AV" },
  ],
  S: [
    { id: "SPS", label: "Standard Practices Structures", prefix: "S-SPS" },
    { id: "ST", label: "Structures", prefix: "S-ST" },
  ],
  REGS: [
    { id: "CARs", label: "Canadian Aviation Regulations (CARs)", prefix: "REGS-CARs" },
    { id: "STDs", label: "Regulations (CARs) and Standards", prefix: "REGS-STDs" },
  ],
}

const getInitialSelection = (examCode?: string) => {
  if (!examCode) return { rating: "", category: "" }
  for (const rating of RATINGS) {
    const category = CATEGORIES[rating.id]?.find((item) => examCode.startsWith(item.prefix))
    if (category) return { rating: rating.id, category: category.id }
  }
  return { rating: "", category: "" }
}

export function ExamSignalControls({
  questionId,
  initialCount,
  initialActive,
  initialExamCode,
  initialConfidence,
  className,
}: ExamSignalControlsProps) {
  const { count, likelihood, active, isLoading, toggle } = useExamSignals(questionId, {
    initialCount,
    initialActive,
  })

  const initialSelection = getInitialSelection(initialExamCode)
  const [rating, setRating] = useState(initialSelection.rating)
  const [category, setCategory] = useState(initialSelection.category)
  const [confidence, setConfidence] = useState(initialConfidence ? String(initialConfidence) : "")

  const isDisabled = isLoading || active

  const handleToggle = () => {
    const categoryOptions = rating ? CATEGORIES[rating] ?? [] : []
    const selectedCategory = categoryOptions.find((item) => item.id === category)
    const examCode = selectedCategory?.prefix ?? ""
    const normalizedConfidence = confidence ? Number(confidence) : null
    const confidenceValue =
      normalizedConfidence && normalizedConfidence >= 1 && normalizedConfidence <= 5 ? normalizedConfidence : null


    toggle({
      examCode: examCode || null,
      confidence: confidenceValue,
    })
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={isLoading}
          className={cn("bg-transparent", active && "border-primary text-primary")}
        >
          <Eye className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Seen on TC exam</span>
          <span className="sm:hidden">Seen</span>
        </Button>
        <span className="text-xs sm:text-sm text-muted-foreground">{count} reported</span>
        <Badge variant="secondary" className="text-xs">
          Exam likelihood: {likelihoodLabels[likelihood]}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Select
          value={rating}
          onValueChange={(value) => {
            setRating(value)
            setCategory("")
          }}
          disabled={isDisabled}
        >
          <SelectTrigger size="sm" className="h-8 w-36 text-xs">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            {RATINGS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory} disabled={isDisabled || !rating}>
          <SelectTrigger size="sm" className="h-8 w-40 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {(CATEGORIES[rating] ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={confidence} onValueChange={setConfidence} disabled={isDisabled}>
          <SelectTrigger size="sm" className="h-8 w-28 text-xs">
            <SelectValue placeholder="Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Low</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5">5 - High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
