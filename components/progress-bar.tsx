import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  className?: string
  color?: "primary" | "success" | "warning" | "danger"
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className,
  color = "primary",
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{percentage}%</span>}
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          color === "success" && "[&>div]:bg-green-500",
          color === "warning" && "[&>div]:bg-amber-500",
          color === "danger" && "[&>div]:bg-red-500",
        )}
      />
    </div>
  )
}
