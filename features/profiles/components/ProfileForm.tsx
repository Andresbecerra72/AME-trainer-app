"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProfile } from "@/features/auth/hooks/useAuth"
import { updateProfileSchema } from "../utils/profile.validation"
import { updateProfile, uploadAvatar } from "../services/profile.api"

export function ProfileForm() {
  const profile = useProfile()

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    bio: profile?.bio ?? "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      updateProfileSchema.parse(form)

      const { error } = await updateProfile(form)
      if (error) throw new Error(error as any)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)

    const { error } = await uploadAvatar(file)

    if (error) setError(error)

    setAvatarLoading(false)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      
      {/* Avatar */}
      <div>
        <Label>Avatar</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
        />
        {avatarLoading && <p>Uploading...</p>}
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
        />
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
