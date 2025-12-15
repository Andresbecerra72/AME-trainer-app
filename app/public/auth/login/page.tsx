"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Plane } from "lucide-react"
import { AuthForm } from "@/features/auth/components/AuthForm"

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState("login")

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Welcome" showBack={false} />

      <div className="container max-w-md mx-auto px-4 pt-20 pb-8">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-aviation-primary rounded-full mb-4">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">AME Exam Trainer</h1>
          <p className="text-muted-foreground">Ace your aircraft maintenance exam</p>
        </div>

        {/* AUTH CARD */}
        <Card className="p-6">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login">
              <AuthForm type="login" />
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register">
              <AuthForm type="register" />
            </TabsContent>
          </Tabs>
        </Card>

        {/* GUEST ACCESS */}
        <div className="mt-6">
          <SecondaryButton onClick={() => router.push("/protected/dashboard")} className="w-full">
            Continue as Guest
          </SecondaryButton>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Limited features available in guest mode
          </p>
        </div>

      </div>
    </div>
  )
}
