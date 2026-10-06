"use server"

import { requireAdmin } from "@/lib/auth"
import { fetchDvsaVehicle, isDvsaConfigured } from "@/lib/dvsa-mot"
import { isDvlaConfigured } from "@/lib/dvla"
import { isPlausibleReg, normaliseReg, type RegLookupResult } from "@/lib/reg-lookup"
import { lookupVehicleByReg as lookupDvla } from "@/app/actions/dvla"

/**
 * Admin-only registration lookup used to optionally prefill the vehicle form.
 * Prefers the DVSA MOT History API (adds model + mileage); falls back to DVLA
 * when only that key is configured. Nothing is saved - the form stays editable.
 */
export async function lookupRegistration(reg: string): Promise<RegLookupResult> {
  await requireAdmin()

  const dvsa = isDvsaConfigured()
  const dvla = isDvlaConfigured()
  if (!dvsa && !dvla) {
    return { ok: false, configured: false, error: "Registration lookup is not configured." }
  }

  const registration = normaliseReg(String(reg ?? ""))
  if (!isPlausibleReg(registration)) {
    return { ok: false, configured: true, error: "Enter a valid UK registration." }
  }

  if (dvsa) {
    const result = await fetchDvsaVehicle(registration)
    if (result.status === "ok") return { ok: true, configured: true, source: "DVSA", data: result.data }
    if (result.status === "not-found") {
      return { ok: false, configured: true, error: "No vehicle found for that registration." }
    }
    if (!dvla) return { ok: false, configured: true, error: "Lookup failed. Try again shortly." }
  }

  const fallback = await lookupDvla(registration)
  if (!fallback.ok) return fallback
  return { ok: true, configured: true, source: "DVLA", data: { ...fallback.data, model: "", mileage: "" } }
}
