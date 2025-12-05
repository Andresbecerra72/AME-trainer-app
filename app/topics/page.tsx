import { MobileHeader } from "@/components/mobile-header"
import { TopicCard } from "@/components/topic-card"
import Link from "next/link"
import { Wrench, Plane, Zap, Cpu, Box, BookOpen } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { getAllTopicsClient } from "@/features/topics/services/topic.api"

const iconMap = {
  wrench: Wrench,
  plane: Plane,
  zap: Zap,
  cpu: Cpu,
  box: Box,
  "book-open": BookOpen,
}

export default async function TopicsPage() {
  //const supabase = await createSupabaseServerClient()

 // const { data: topics, error } = await supabase.from("topics").select("*, questions(count)").order("name")
  const  topics = await getAllTopicsClient()

  // if (error) {
  //   console.error("Error fetching topics:", error)
  // }

  const topicsWithProgress =
    topics?.map((topic) => {
      const questionCount = topic.questions?.[0]?.count || 0
      return {
        id: topic.id,
        name: topic.name,
        slug: topic.slug ,
        icon: topic.icon || "book-open",
        progress: 0, // TODO: Calculate from user progress
        questionsCount: questionCount,
      }
    }) || [
      {
        id: "",
        name: "",
        slug: "",
        icon: "book-open",
        progress: 0, // TODO: Calculate from user progress
        questionsCount: 1,
      }
    ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Study Topics" showBack />

      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <p className="text-muted-foreground text-sm px-1">Select a topic to start studying</p>

        {topicsWithProgress.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No topics available yet.</p>
        ) : (
          topicsWithProgress.map((topic) => {
            const Icon = iconMap[topic.icon as keyof typeof iconMap] || BookOpen
            return (
              <Link key={topic.id} href={`/topics/${topic.slug}`}>
                <TopicCard
                  title={topic.name}
                  icon={Icon}
                  progress={topic.progress}
                  questionsCount={topic.questionsCount}
                />
              </Link>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
