"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "../services/auth.api";

export function useLogout() {
  const router = useRouter();

  async function logout() {
    await logoutUser();
    router.replace("/auth/login");
  }

  return logout;
}
