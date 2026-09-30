"use server"

import { cookies } from "next/headers"
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin"
import { isAllowedAdminEmail, SESSION_COOKIE_NAME } from "@/lib/auth"

const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000 // 5 days

export interface AdminAuthResult {
  ok: boolean
  error?: string
}

/**
 * Exchanges a freshly issued Firebase ID token for an httpOnly session
 * cookie, but only if the account is on the ADMIN_EMAILS allowlist.
 */
export async function createAdminSession(idToken: string): Promise<AdminAuthResult> {
  if (!isFirebaseAdminConfigured()) {
    return { ok: false, error: "Admin sign-in is not configured on the server." }
  }
  if (typeof idToken !== "string" || idToken.length === 0 || idToken.length > 4096) {
    return { ok: false, error: "Sign-in failed. Please try again." }
  }

  try {
    const decoded = await adminAuth().verifyIdToken(idToken, true)

    if (!isAllowedAdminEmail(decoded.email) || decoded.email_verified === false) {
      return { ok: false, error: "This account does not have admin access." }
    }

    // createSessionCookie only accepts tokens issued in the last 5 minutes.
    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    })

    return { ok: true }
  } catch (error) {
    console.error("[admin-auth] Failed to create session:", error)
    return { ok: false, error: "Sign-in failed. Please try again." }
  }
}

export async function endAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
