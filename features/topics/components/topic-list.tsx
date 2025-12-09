"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteTopic } from "@/lib/db-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Topic {
  id: string
  name: string
  description: string | null
}

export function TopicList({ topics }: { topics: Topic[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    setIsDeleting(id)
    const result = await deleteTopic(id)

    if (result.success) {
      toast({
        title: "Success",
        description: "Topic deleted successfully",
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete topic",
        variant: "destructive",
      })
    }
    setIsDeleting(null)
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <Card key={topic.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">{topic.name}</h3>
                {topic.description && <p className="text-sm text-muted-foreground">{topic.description}</p>}
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/topics/${topic.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(topic.id, topic.name)}
                  disabled={isDeleting === topic.id}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
