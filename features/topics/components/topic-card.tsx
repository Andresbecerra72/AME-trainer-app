"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as LucideIcons from "lucide-react"
import { ReactNode } from "react"

interface TopicCardProps {
  name: string
  code?: string | null
  icon?: string | null
  description?: string | null
  actions?: ReactNode
  className?: string
}

export function TopicCard({ name, code, icon, description, actions, className }: TopicCardProps) {
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent
  }

  const renderIcon = (iconName: string | null | undefined) => {
    if (!iconName) return <LucideIcons.Book className="h-6 w-6" />
    
    // Si es un emoji
    if (/[\u{1F300}-\u{1F9FF}]/u.test(iconName)) {
      return <span className="text-2xl">{iconName}</span>
    }
    
    // Si es un ícono de Lucide
    const IconComponent = getIconComponent(iconName)
    if (IconComponent) {
      return <IconComponent className="h-6 w-6" />
    }
    
    return <LucideIcons.Book className="h-6 w-6" />
  }

  return (
    <Card className={`overflow-hidden active:scale-[0.98] transition-transform ${className || ""}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Ícono destacado */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary">
            {renderIcon(icon)}
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-base leading-tight">{name || "Topic Name"}</h3>
              {/* Botones de acción */}
              {actions && (
                <div className="flex gap-1 flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>

            {/* Badge y descripción en línea vertical */}
            <div className="space-y-2">
              {code && (
                <Badge variant="secondary" className="text-xs font-mono">
                  {code}
                </Badge>
              )}
              {description ? (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                  {description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">
                  No description
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
