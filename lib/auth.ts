import "server-only"
import { cookies } from "next/headers"
import { isFirebaseAdminConfigured, adminAuth } from "@/lib/firebase/admin"

export const SESSION_COOKIE_NAME = "__session"

function adminEmails(): string[] {
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
