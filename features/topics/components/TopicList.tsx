export function TopicList({ topics }: { topics: any[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((t) => (
        <div
          key={t.id}
          className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50 transition"
        >
          <h3 className="font-semibold">{t.name}</h3>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </div>
      ))}
    </div>
  );
}
