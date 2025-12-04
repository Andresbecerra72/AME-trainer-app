import { useUser } from "../components/UserProvider"


export function useRole() {
  const { role } = useUser()
  return role
}

export function useHasRole(required: string | string[]) {
  const { role } = useUser()

  if (Array.isArray(required)) {
    return required.includes(role)
  }

  return role === required
}
