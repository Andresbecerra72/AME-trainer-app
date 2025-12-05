import { createSupabaseServerClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getEditSuggestions, reviewEditSuggestion } from "@/lib/db-actions"
import { BottomNav } from "@/components/bottom-nav"

export default async function EditSuggestionsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    redirect("/dashboard")
  }

  const editSuggestions = await getEditSuggestions()
  const pendingSuggestions = editSuggestions.filter((s: any) => s.status === "pending")

  async function approveSuggestion(formData: FormData) {
    "use server"
    const suggestionId = formData.get("suggestionId") as string
    await reviewEditSuggestion(suggestionId, "approved", true)
  }

  async function rejectSuggestion(formData: FormData) {
    "use server"
    const suggestionId = formData.get("suggestionId") as string
    await reviewEditSuggestion(suggestionId, "rejected", false)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Edit Suggestions" showBack />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pending Suggestions ({pendingSuggestions.length})</h2>
        </div>

        {pendingSuggestions.length === 0 ? (
          <MobileCard className="text-center py-8">
            <p className="text-muted-foreground">No pending edit suggestions</p>
          </MobileCard>
        ) : (
          <div className="space-y-3">
            {pendingSuggestions.map((suggestion: any) => (
              <MobileCard key={suggestion.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/community/questions/${suggestion.question_id}`}
                        className="font-medium hover:underline line-clamp-2"
                      >
                        {suggestion.original_data.question_text}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Suggested by {suggestion.suggested_by_user?.full_name || "Anonymous"}
                      </p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="font-medium">Reason:</p>
                    <p className="text-muted-foreground">{suggestion.reason}</p>
                  </div>

                  <div className="flex gap-2">
                    <form action={approveSuggestion} className="flex-1">
                      <input type="hidden" name="suggestionId" value={suggestion.id} />
                      <Button type="submit" size="sm" className="w-full">
                        Approve & Apply
                      </Button>
                    </form>
                    <form action={rejectSuggestion} className="flex-1">
                      <input type="hidden" name="suggestionId" value={suggestion.id} />
                      <Button type="submit" size="sm" variant="outline" className="w-full bg-transparent">
                        Reject
                      </Button>
                    </form>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/edit-suggestions/${suggestion.id}`}>View Diff</Link>
                    </Button>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav userRole={profile?.role || "user"} />
    </div>
  )
}
