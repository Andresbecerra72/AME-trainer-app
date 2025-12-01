"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PrimaryButton } from "@/components/primary-button"
import { SecondaryButton } from "@/components/secondary-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plane } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock authentication - in a real app, this would call an API
    router.push("/dashboard")
  }

  const handleGuestAccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-accent/90 p-4 rounded-2xl">
            <Plane className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-primary-foreground/80 mt-1">
          {isLogin ? "Sign in to continue your studies" : "Create your account"}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="h-12"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <PrimaryButton type="submit" fullWidth>
              {isLogin ? "Login" : "Register"}
            </PrimaryButton>

            <SecondaryButton type="button" onClick={handleGuestAccess} fullWidth>
              Continue as Guest
            </SecondaryButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
