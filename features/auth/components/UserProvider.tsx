"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { supabaseBrowserClient } from "@/lib/supabase/client"

const UserContext = createContext<any>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState("user")

  useEffect(() => {
    const supabase = supabaseBrowserClient

    // Load initial session
    supabase.auth.getSession().then(async ({ data }) => {
      console.log("Initial session data:", data);
      if (!data.session) return

      const currentUser = data.session.user
      setUser(currentUser as any)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single()

      setProfile(profileData)
      setRole(profileData?.role ?? "user")
    })

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (evt, session) => {
        if (session?.user) {
          setUser(session.user as any)

          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          setProfile(profileData)
          setRole(profileData?.role ?? "user")
        } else {
          setUser(null)
          setProfile(null)
          setRole("user")
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, profile, role }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
