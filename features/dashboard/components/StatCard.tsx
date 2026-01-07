import { Award, MessageSquare, Bookmark } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  href?: string
  gradient: string
}

export function StatCard({ label, value, icon: Icon, href, gradient }: StatCardProps) {
  const content = (
    <div className={`relative overflow-hidden rounded-xl p-4 sm:p-5 ${gradient} border border-border/50 hover:border-primary/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <Icon className="w-full h-full" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {href && (
            <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1 tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
          {label}
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
