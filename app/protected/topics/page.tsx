import { getAllTopicsServer } from "@/features/topics/services/topic.server";
import { TopicList } from "@/features/topics/components/topic-list";

export default async function TopicsPage() {
  const topics = await getAllTopicsServer();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Study Topics</h1>

      <TopicList topics={topics} />
    </div>
  );
}
