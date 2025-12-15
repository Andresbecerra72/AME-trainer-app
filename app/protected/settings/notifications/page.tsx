import { MobileHeader } from "@/components/mobile-header"
import { MobileCard } from "@/components/mobile-card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Mail, MessageSquare, ThumbsUp, Edit, Award, Flame, FileText } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/db-actions"

export default async function NotificationSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/public/auth/login")
  }

  const preferences = (await getNotificationPreferences(user.id)) || {
    email_notifications: true,
    push_notifications: true,
    notify_on_comment: true,
    notify_on_vote: true,
    notify_on_answer: false,
    notify_on_edit_suggestion: true,
    notify_on_question_approved: true,
    notify_on_report_resolved: true,
    notify_on_badge_earned: true,
    notify_on_streak_milestone: true,
    notify_weekly_digest: true,
  }

  async function updatePreference(field: string, value: boolean) {
    "use server"
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await updateNotificationPreferences(user.id, { [field]: value })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Notification Settings" showBack />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <MobileCard className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            General Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="text-base cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
              </div>
              <form action={updatePreference.bind(null, "email_notifications", !preferences.email_notifications)}>
                <Switch id="email-notifications" defaultChecked={preferences.email_notifications} />
              </form>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications" className="text-base cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                </div>
              </div>
              <form action={updatePreference.bind(null, "push_notifications", !preferences.push_notifications)}>
                <Switch id="push-notifications" defaultChecked={preferences.push_notifications} />
              </form>
            </div>
          </div>
        </MobileCard>

        <MobileCard className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Activity Notifications</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notify-comment" className="text-base cursor-pointer">
                    Comments
                  </Label>
                  <p className="text-sm text-muted-foreground">When someone comments on your questions</p>
                </div>
              </div>
              <form action={updatePreference.bind(null, "notify_on_comment", !preferences.notify_on_comment)}>
                <Switch id="notify-comment" defaultChecked={preferences.notify_on_comment} />
              </form>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notify-vote" className="text-base cursor-pointer">
                    Votes
                  </Label>
                  <p className="text-sm text-muted-foreground">When someone votes on your content</p>
                </div>
              </div>
              <form action={updatePreference.bind(null, "notify_on_vote", !preferences.notify_on_vote)}>
                <Switch id="notify-vote" defaultChecked={preferences.notify_on_vote} />
              </form>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Edit className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notify-edit" className="text-base cursor-pointer">
                    Edit Suggestions
                  </Label>
                  <p className="text-sm text-muted-foreground">When your edit suggestions are reviewed</p>
                </div>
              </div>
              <form
                action={updatePreference.bind(
                  null,
                  "notify_on_edit_suggestion",
                  !preferences.notify_on_edit_suggestion,
                )}
              >
                <Switch id="notify-edit" defaultChecked={preferences.notify_on_edit_suggestion} />
              </form>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notify-approved" className="text-base cursor-pointer">
                    Question Approved
                  </Label>
                  <p className="text-sm text-muted-foreground">When your questions are approved</p>
                </div>
              </div>
              <form
                action={updatePreference.bind(
                  null,
                  "notify_on_question_approved",
                  !preferences.notify_on_question_approved,
                )}
              >
                <Switch id="notify-approved" defaultChecked={preferences.notify_on_question_approved} />
              </form>
            </div>
          </div>
        </MobileCard>

        <MobileCard className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Achievement Notifications</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Award className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notify-badge" className="text-base cursor-pointer">
                    Badges Earned
                  </Label>
                  <p className="text-sm text-muted-foreground">When you earn a new badge</p>
                </div>
              </div>
              <form action={updatePreference.bind(null, "notify_on_badge_earned", !preferences.notify_on_badge_earned)}>
                <Switch id="notify-badge" defaultChecked={preferences.notify_on_badge_earned} />
              </form>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Flame className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notify-streak" className="text-base cursor-pointer">
                    Streak Milestones
                  </Label>
                  <p className="text-sm text-muted-foreground">When you reach streak milestones</p>
                </div>
              </div>
              <form
                action={updatePreference.bind(
                  null,
                  "notify_on_streak_milestone",
                  !preferences.notify_on_streak_milestone,
                )}
              >
                <Switch id="notify-streak" defaultChecked={preferences.notify_on_streak_milestone} />
              </form>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notify-digest" className="text-base cursor-pointer">
                    Weekly Digest
                  </Label>
                  <p className="text-sm text-muted-foreground">Weekly summary of activity</p>
                </div>
              </div>
              <form action={updatePreference.bind(null, "notify_weekly_digest", !preferences.notify_weekly_digest)}>
                <Switch id="notify-digest" defaultChecked={preferences.notify_weekly_digest} />
              </form>
            </div>
          </div>
        </MobileCard>
      </div>

      <BottomNav />
    </div>
  )
}
