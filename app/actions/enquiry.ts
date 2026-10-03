"use server"

import { headers } from "next/headers"
import { enquirySchema, type EnquiryValues, ENQUIRY_MIN_FILL_MS } from "@/lib/validations/enquiry"
import { isFirebaseAdminConfigured, adminDb, assertFirebaseConfiguredInProduction } from "@/lib/firebase/admin"
import { isResendConfigured, sendEnquiryEmail } from "@/lib/email/enquiry"

export interface EnquiryResult {
  ok: boolean
  error?: string
}

/** Best-effort per-instance rate limit (email + IP). */
const recentHits = new Map<string, number[]>()
const RATE_WINDOW_MS = 60 * 60 * 1000
const MAX_HITS_PER_KEY = 5

function pruneAndCount(key: string, now: number) {
  const existing = recentHits.get(key) ?? []
  const fresh = existing.filter((time) => now - time < RATE_WINDOW_MS)
  recentHits.set(key, fresh)
  return fresh.length
}

function assertWithinRateLimit(email: string, ip: string) {
  const now = Date.now()
  const emailHits = pruneAndCount(`email:${email.toLowerCase()}`, now)
  const ipHits = pruneAndCount(`ip:${ip}`, now)

  if (emailHits >= MAX_HITS_PER_KEY || ipHits >= MAX_HITS_PER_KEY) {
    throw new Error("Too many enquiries. Please wait a while or call us instead.")
  }

  const emailTimes = recentHits.get(`email:${email.toLowerCase()}`) ?? []
  emailTimes.push(now)
  recentHits.set(`email:${email.toLowerCase()}`, emailTimes)

  const ipTimes = recentHits.get(`ip:${ip}`) ?? []
  ipTimes.push(now)
  recentHits.set(`ip:${ip}`, ipTimes)
}

async function clientIp() {
  const headerStore = await headers()
  const forwarded = headerStore.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return headerStore.get("x-real-ip") ?? "unknown"
}

/**
 * Contact and vehicle enquiries. Email via Resend is required for success.
 * A Firestore copy is kept when Firebase Admin is configured.
 */
export async function submitEnquiry(input: EnquiryValues): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }
  }

  // Honeypot tripped: pretend success so bots don't retry.
  if (parsed.data.company || parsed.data.websiteUrl) {
    return { ok: true }
  }

  const startedAt = Number.parseInt(parsed.data.formStartedAt, 10)
  if (
    !Number.isFinite(startedAt) ||
    Date.now() - startedAt < ENQUIRY_MIN_FILL_MS
  ) {
    return { ok: true }
  }

  if (!isResendConfigured()) {
    return {
      ok: false,
      error: "Enquiries are temporarily unavailable. Please call us instead.",
    }
  }

  try {
    assertFirebaseConfiguredInProduction()
    assertWithinRateLimit(parsed.data.email, await clientIp())

    await sendEnquiryEmail(parsed.data)

    if (isFirebaseAdminConfigured()) {
      try {
        await adminDb()
          .collection("enquiries")
          .add({
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            message: parsed.data.message,
            vehicleSlug: parsed.data.vehicleSlug,
            vehicleTitle: parsed.data.vehicleTitle,
            createdAt: new Date().toISOString(),
          })
      } catch (storeError) {
        // Email already sent - do not fail the visitor, but log for follow-up.
        console.error("Enquiry email sent but Firestore save failed:", storeError)
      }
    }

    return { ok: true }
  } catch (error) {
    console.error("Failed to submit enquiry:", error)
    const message =
      error instanceof Error && error.message.startsWith("Too many enquiries")
        ? error.message
        : "Something went wrong sending your enquiry. Please call us instead."
    return { ok: false, error: message }
  }
}
