import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ActionCardProps {
  title: string
  description: string
  icon: React.ElementType
  path: string
  color: string
  bgColor: string
}

export function ActionCard({ title, description, icon: Icon, path, color, bgColor }: ActionCardProps) {
  return (
    <Link href={path} className="block group">
      <div className={`relative rounded-xl border border-border ${bgColor} p-5 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden h-full`}>
        {/* Background Decoration */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl bg-primary" />
        
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-xl ${bgColor} border border-border/50 mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${color}`} />
        </div>

        {/* Content */}
        <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 flex items-center justify-between">
          {title}
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  )
}
