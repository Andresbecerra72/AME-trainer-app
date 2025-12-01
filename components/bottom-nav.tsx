"use client"

import { Home, Users, Bell, User, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  userRole?: "user" | "admin" | "super_admin"
  unreadNotifications?: number
}

export function BottomNav({ userRole = "user", unreadNotifications = 0 }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Community",
      icon: Users,
      href: "/community",
      active: pathname?.startsWith("/community"),
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/notifications",
      active: pathname === "/notifications",
      badge: unreadNotifications,
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile/me",
      active: pathname?.startsWith("/profile"),
    },
  ]

  // Add admin tab for admin/super_admin users
  if (userRole === "admin" || userRole === "super_admin") {
    navItems.splice(3, 0, {
      label: "Admin",
      icon: Shield,
      href: "/admin",
      active: pathname?.startsWith("/admin"),
    })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-2xl mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                  item.active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
