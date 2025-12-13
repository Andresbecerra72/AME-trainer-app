"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteTopic } from "@/lib/db-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TopicCard } from "./topic-card"

interface Topic {
  id: string
  name: string
  code: string | null
  icon: string | null
  description: string | null
}

export function TopicList({ topics }: { topics: Topic[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; name: string } | null>(null)
  const router = useRouter()

  const openDeleteConfirm = (id: string, name: string) => {
    setTopicToDelete({ id, name })
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!topicToDelete) return

    setIsDeleting(topicToDelete.id)
    const result = await deleteTopic(topicToDelete.id)

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
    setTopicToDelete(null)
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          name={topic.name}
          code={topic.code}
          icon={topic.icon}
          description={topic.description}
          actions={
            <>
              <Link href={`/admin/topics/${topic.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => openDeleteConfirm(topic.id, topic.name)}
                disabled={isDeleting === topic.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          }
        />
      ))}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Delete Topic"
        description={`Are you sure you want to delete "${topicToDelete?.name}"? This action cannot be undone and will affect all questions associated with this topic.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
