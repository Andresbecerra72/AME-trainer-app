"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useState } from "react"

export function LogoutButton() {
  const logout = useLogout()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}
