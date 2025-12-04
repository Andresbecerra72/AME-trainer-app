import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  console.log("Middleware triggered for:", request.nextUrl.pathname);
  const url = request.nextUrl
  const pathname = url.pathname

  const ADMIN_PATHS = ["/admin"]
  const SUPER_PATHS = ["/super"]
  const PROTECTED_PATHS = ["/dashboard", "/questions", "/community", "/profile"]

  let response = NextResponse.next({ request })

  // Supabase SSR client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get auth user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if route is protected
  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtected && !user) {
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Check admin routes
  if (user && ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin" && profile?.role !== "super_admin") {
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  // Check super admin routes
  if (user && SUPER_PATHS.some((path) => pathname.startsWith(path))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "super_admin") {
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/questions/:path*",
    "/community/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/super/:path*",
  ],
}
