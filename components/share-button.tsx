"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  title: string
  text: string
  url: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ShareButton({ title, text, url, variant = "ghost", size = "sm" }: ShareButtonProps) {
  const { toast } = useToast()

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: fullUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.error("[v0] Error sharing:", error)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(fullUrl)
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleShare}>
      <Share2 className="w-4 h-4" />
    </Button>
  )
}
