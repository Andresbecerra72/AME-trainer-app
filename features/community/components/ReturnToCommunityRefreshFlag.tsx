"use client"

import { useEffect } from "react"

export const REFRESH_FLAG_KEY = "community:refreshOnReturn"

export function ReturnToCommunityRefreshFlag() {
  useEffect(() => {
    const markRefresh = () => {
      localStorage.setItem(REFRESH_FLAG_KEY, "1")
    }

    window.addEventListener("pagehide", markRefresh)

    return () => {
      markRefresh()
      window.removeEventListener("pagehide", markRefresh)
    }
  }, [])

  return null
}


/** * This component sets a flag in localStorage when the user leaves the page (e.g. to go back to the community list).
 * The community list page can check this flag on load and refresh the questions if needed, ensuring that any changes made
 * to a question are reflected when the user returns.
 */
/* Usage:
- Include <ReturnToCommunityRefreshFlag /> in the question detail and edit pages (e.g. app/protected/community/questions/[id]/page.tsx and app/protected/community/questions/[id]/edit/page.tsx).
- In the community list page (app/protected/community/page.tsx), check localStorage.getItem(REFRESH_FLAG_KEY) on load. If it's set, refresh the questions and then clear the flag.
*/
/* Example of checking the flag in the community list page:
  useEffect(() => {
    const maybeRefresh = () => {
      const shouldRefresh = localStorage.getItem(REFRESH_FLAG_KEY) === "1"
      if (!shouldRefresh) return
      localStorage.removeItem(REFRESH_FLAG_KEY)
      router.refresh()
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        maybeRefresh()
      }
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        maybeRefresh()
      }
    }

    maybeRefresh()

    window.addEventListener("pageshow", handlePageShow)
    window.addEventListener("focus", handleVisibility)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("pageshow", handlePageShow)
      window.removeEventListener("focus", handleVisibility)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [router])
  */
