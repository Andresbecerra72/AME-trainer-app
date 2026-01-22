"use client"

import { useRole as useRoleFromAuth } from "./useAuth"


export function useRole() {
  return useRoleFromAuth()
}

export function useHasRole(required: string | string[]) {
  const role = useRoleFromAuth()

  if (Array.isArray(required)) {
    return required.includes(role)
  }

  return role === required
}
