"use server"

import { enquirySchema, type EnquiryValues } from "@/lib/validations/enquiry"
import { isFirebaseAdminConfigured, adminDb, assertFirebaseConfiguredInProduction } from "@/lib/firebase/admin"

export interface EnquiryResult {
  ok: boolean
  error?: string
}

/**
 * Handles both the general contact form and per-vehicle enquiries. When
 * Firebase Admin isn't configured, submissions are accepted but not
 * persisted anywhere - the site is running on mock data, so there is
 * nowhere durable to write them yet.
 */
export async function submitEnquiry(input: EnquiryValues): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }
  }

  try {
    assertFirebaseConfiguredInProduction()
    if (isFirebaseAdminConfigured()) {
      await adminDb()
        .collection("enquiries")
        .add({
          ...parsed.data,
          createdAt: new Date().toISOString(),
        })
    }

    return { ok: true }
  } catch (error) {
    console.error("[v0] Failed to save enquiry:", error)
    return { ok: false, error: "Something went wrong sending your enquiry. Please call us instead." }
  }
}
