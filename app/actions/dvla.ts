"use server"

import { requireAdmin } from "@/lib/auth"
import { getDvlaApiKey, isDvlaConfigured } from "@/lib/dvla"
import { FUEL_TYPES } from "@/lib/types"

export type DvlaLookupResult =
  | {
      ok: true
      configured: true
      data: {
        make: string
        year: string
        fuel: string
        colour: string
        motExpiry: string
        engineSize: string
      }
    }
  | { ok: false; configured: boolean; error: string }

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function mapFuel(fuelType: string | undefined) {
  if (!fuelType) return ""
  const normalised = fuelType.trim().toUpperCase()
  if (normalised.includes("DIESEL")) return "Diesel"
  if (normalised.includes("ELECTRIC")) return "Electric"
  if (normalised.includes("HYBRID")) return "Hybrid"
  if (normalised.includes("LPG")) return "LPG"
  if (normalised.includes("PETROL") || normalised.includes("GAS")) return "Petrol"

  const match = FUEL_TYPES.find((fuel) => fuel.toUpperCase() === normalised)
  return match ?? titleCase(fuelType)
}

function mapEngineSize(cc: number | undefined) {
  if (!cc || !Number.isFinite(cc) || cc <= 0) return ""
  return `${(cc / 1000).toFixed(1)}L`
}

/**
 * Admin-only DVLA Vehicle Enquiry lookup. Prefills make, year, fuel, colour,
 * MOT expiry and engine size. Hidden in the UI when DVLA_API_KEY is missing.
 */
export async function lookupVehicleByReg(reg: string): Promise<DvlaLookupResult> {
  await requireAdmin()

  const apiKey = getDvlaApiKey()
  if (!apiKey || !isDvlaConfigured()) {
    return { ok: false, configured: false, error: "DVLA lookup is not configured." }
  }

  const registrationNumber = reg.replace(/[\s-]/g, "").toUpperCase()
  if (!/^[A-Z0-9]{5,8}$/.test(registrationNumber)) {
    return { ok: false, configured: true, error: "Enter a valid UK registration." }
  }

  try {
    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ registrationNumber }),
        cache: "no-store",
      },
    )

    if (response.status === 404) {
      return { ok: false, configured: true, error: "No vehicle found for that registration." }
    }

    if (!response.ok) {
      console.error("DVLA lookup failed:", response.status, await response.text())
      return { ok: false, configured: true, error: "DVLA lookup failed. Try again shortly." }
    }

    const payload = (await response.json()) as {
      make?: string
      yearOfManufacture?: number
      fuelType?: string
      colour?: string
      motExpiryDate?: string
      engineCapacity?: number
    }

    return {
      ok: true,
      configured: true,
      data: {
        make: payload.make ? titleCase(payload.make) : "",
        year: payload.yearOfManufacture ? String(payload.yearOfManufacture) : "",
        fuel: mapFuel(payload.fuelType),
        colour: payload.colour ? titleCase(payload.colour) : "",
        motExpiry: payload.motExpiryDate ?? "",
        engineSize: mapEngineSize(payload.engineCapacity),
      },
    }
  } catch (error) {
    console.error("DVLA lookup error:", error)
    return { ok: false, configured: true, error: "DVLA lookup failed. Try again shortly." }
  }
}
