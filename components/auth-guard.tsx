import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/db-actions"
import type { UserRole } from "@/lib/types"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export async function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "super_admin") {
    redirect("/dashboard")
  }

  return <>{children}</>
}
