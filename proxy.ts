import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Optimistic check only: bounce visitors with no session cookie to the login
 * page. Real verification (signature, revocation, allowlist) happens on the
 * server in requireAdmin() / requireAdminPage().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/admin/login") return NextResponse.next()

  if (!request.cookies.get("__session")?.value) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
