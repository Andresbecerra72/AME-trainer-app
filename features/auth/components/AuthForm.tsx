"use client";

import { useState } from "react";
import { loginSchema, registerSchema } from "../utils/auth.validation";
import { loginUser, registerUser } from "../services/auth.api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AuthForm({ type }: { type: "login" | "register" }) {
  const router = useRouter();
  const isLogin = type === "login";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        loginSchema.parse(form);

        const { error } = await loginUser(form.email, form.password);
        if (error) throw error;

        router.replace("/dashboard");
      } else {
        registerSchema.parse(form);

        const { error } = await registerUser(form.email, form.password);
        if (error) throw error;

        // Opcional: Enviar full_name usando RPC o endpoint interno
        // Pero NO modificamos tu UI.

        router.replace("/auth/login");
      }
    } catch (err: any) {
      setError(err.message ?? "Error processing request");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="John Doe"
            onChange={handleChange}
            value={form.full_name}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          onChange={handleChange}
          value={form.email}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="••••••"
          onChange={handleChange}
          value={form.password}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full">
        {isLogin ? "Sign In" : "Create Account"}
      </Button>
    </form>
  );
}
