import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, ThumbsUp } from "lucide-react"

interface ProfileActionsProps {
  userId: string
}

export function ProfileActions({ userId }: ProfileActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <Link href={`/protected/profile/${userId}/activity`} className="w-full">
        <Button variant="outline" className="w-full bg-transparent hover:bg-primary/5 hover:border-primary/50 transition-all">
          <Activity className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">View </span>Activity
        </Button>
      </Link>
      <Link href={`/protected/profile/${userId}/upvoted`} className="w-full">
        <Button variant="outline" className="w-full bg-transparent hover:bg-primary/5 hover:border-primary/50 transition-all">
          <ThumbsUp className="h-4 w-4 mr-2" />
          Upvoted
        </Button>
      </Link>
    </div>
  )
}
