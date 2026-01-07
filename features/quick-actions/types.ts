export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  bg_color: string
  path: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoleQuickAction {
  id: string
  role: "user" | "admin" | "super_admin"
  quick_action_id: string
  is_hidden: boolean
  display_order: number
  created_at: string
  updated_at: string
  quick_action?: QuickAction
}

export interface QuickActionWithVisibility extends QuickAction {
  is_hidden: boolean
  role_display_order: number
}

export type UpdateRoleQuickActionPayload = {
  role: string
  quick_action_id: string
  is_hidden: boolean
  display_order?: number
}
