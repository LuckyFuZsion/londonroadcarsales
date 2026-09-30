import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isFirebaseAdminConfigured, adminAuth } from "@/lib/firebase/admin"

export const SESSION_COOKIE_NAME = "__session"

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export interface AdminSession {
  uid: string
  email: string
}

/**
 * Verifies the session cookie server-side. Returns null if Firebase Admin
 * isn't configured, there's no cookie, the cookie is invalid, ADMIN_EMAILS is
 * empty, or the signed-in email isn't in ADMIN_EMAILS.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isFirebaseAdminConfigured()) return null

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
    const email = decoded.email?.toLowerCase() ?? ""
    const allowList = adminEmails()

    // Fail closed: an empty or missing allowlist means nobody is an admin.
    if (allowList.length === 0 || !allowList.includes(email)) {
      return null
    }

    return { uid: decoded.uid, email }
  } catch {
    return null
  }
}

/** True if this email is on the ADMIN_EMAILS allowlist. An empty list denies everyone. */
export function isAllowedAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

/**
 * Call first in EVERY admin server action and admin API route. Throws if the
 * caller is not a signed-in, allowlisted admin.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) throw new Error("Unauthorised")
  return session
}

/** For admin pages and layouts: redirects to the login page instead of throwing. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")
  return session
}
