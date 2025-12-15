import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createCollection } from "@/features/collections/api"

export default async function CreateCollectionPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Create Collection" showBack />

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form action={createCollection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Important Questions"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What's this collection about?"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Create Collection
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNav userRole={profile?.role} />
    </div>
  )
}
