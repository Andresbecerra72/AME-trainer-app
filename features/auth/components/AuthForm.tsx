"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginSchema, registerSchema } from "../utils/auth.validation"
import { loginUser, registerUser, updateProfileFullName } from "../services/auth.api"
import { useRefreshProfile } from "../hooks/useAuth"

interface FormState {
  full_name: string
  email: string
  password: string
  confirmPassword: string
}

const initialFormState: FormState = {
  full_name: "",
  email: "",
  password: "",
  confirmPassword: "",
}

interface AuthFormProps {
  type: "login" | "register"
  onLoginFailed?: (tab: string) => void
}

export function AuthForm({ type, onLoginFailed }: AuthFormProps) {
  const router = useRouter()
  const refreshProfile = useRefreshProfile()
  const [isLogin, setIsLogin] = useState(type === "login")

  const [form, setForm] = useState<FormState>(initialFormState)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpiar error al empezar a escribir
    if (error) setError("")
  }, [error])

  const handleLogin = useCallback(async () => {
    loginSchema.parse(form)

    const { error } = await loginUser(form.email, form.password)
    if (error) {
      setIsLogin(false)
      onLoginFailed && onLoginFailed("register")
    }

    // El AuthProvider detectará el cambio automáticamente
    router.replace("/protected/dashboard")
  }, [form, router])

  const handleRegister = useCallback(async () => {
    registerSchema.parse(form)

    if (form.password !== form.confirmPassword) {
      throw new Error("Passwords do not match")
    }

    const { data, error } = await registerUser(
      form.email,
      form.password,
      form.full_name
    )

    if (error) throw error

    // Actualizar perfil con nombre completo
    if (data?.user?.id) {
      await updateProfileFullName(data.user.id, form.full_name)
    }

    // Limpiar formulario
    setForm(initialFormState)
    onLoginFailed && onLoginFailed("login")
    
  }, [form, router])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setLoading(true)

      try {
        if (isLogin) {
          await handleLogin()
        } else {
          await handleRegister()
        }
      } catch (err: any) {
        console.error("Auth error:", err)
        setError(
          err.message || 
          "An unexpected error occurred. Please try again."
        )
      } finally {
        setLoading(false)
      }
    },
    [isLogin, handleLogin, handleRegister]
  )

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
            disabled={loading}
            required
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
          disabled={loading}
          required
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
          disabled={loading}
          required
          minLength={6}
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
            disabled={loading}
            required
            minLength={6}
          />
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
      </Button>
    </form>
  )
}
