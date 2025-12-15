"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginSchema, registerSchema } from "../utils/auth.validation"
import { loginUser, registerUser, updateProfileFullName } from "../services/auth.api"

export function AuthForm({ type }: { type: "login" | "register" }) {
  const router = useRouter()
  const isLogin = type === "login"

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        // Validate
        loginSchema.parse(form)

        const { error } = await loginUser(form.email, form.password)
        if (error) throw error

        router.replace("/protected/dashboard")
        return
      }

      // REGISTER FLOW
      registerSchema.parse(form)

      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      const { data, error } = await registerUser(form.email, form.password, form.full_name)

      if (error) throw error

      // Update profile name (some auth triggers don't propagate metadata)
      if (data?.user?.id) {
        await updateProfileFullName(data.user.id, form.full_name)
      }

      router.replace("/public/auth/login")

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* NAME (only register) */}
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="John Doe"
            value={form.full_name}
            onChange={handleChange}
          />
        </div>
      )}

      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="•••••••"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      {/* CONFIRM PASSWORD */}
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="•••••••"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
      </Button>
    </form>
  )
}
