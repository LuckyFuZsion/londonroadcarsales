import "server-only"

import { mapEngineSize, mapFuel, titleCase, type RegLookupData } from "@/lib/reg-lookup"

const API_BASE = "https://history.mot.api.gov.uk/v1/trade/vehicles/registration/"

export function isDvsaConfigured() {
  return Boolean(
    process.env.MOT_CLIENT_ID?.trim() &&
      process.env.MOT_CLIENT_SECRET?.trim() &&
      process.env.MOT_API_KEY?.trim() &&
      process.env.MOT_TOKEN_URL?.trim() &&
      process.env.MOT_SCOPE_URL?.trim(),
  )
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.value

  const response = await fetch(process.env.MOT_TOKEN_URL!.trim(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.MOT_CLIENT_ID!.trim(),
      client_secret: process.env.MOT_CLIENT_SECRET!.trim(),
      scope: process.env.MOT_SCOPE_URL!.trim(),
    }),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`DVSA token request failed: ${response.status}`)

  const json = (await response.json()) as { access_token: string; expires_in?: number }
  cachedToken = { value: json.access_token, expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000 }
  return cachedToken.value
}

interface DvsaTest {
  completedDate?: string
  testResult?: string
  expiryDate?: string
  odometerValue?: string | number
  odometerUnit?: string
}

interface DvsaVehicle {
  make?: string
  model?: string
  fuelType?: string
  primaryColour?: string
  registrationDate?: string
  firstUsedDate?: string
  manufactureDate?: string
  engineSize?: string | number
  motTestDueDate?: string
  motTests?: DvsaTest[]
}

async function fetchVehicle(reg: string): Promise<Response> {
  const call = async () =>
    fetch(API_BASE + encodeURIComponent(reg), {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "X-API-Key": process.env.MOT_API_KEY!.trim(),
        Accept: "application/json",
      },
      cache: "no-store",
    })

  let response = await call()
  if (response.status === 401) {
    cachedToken = null
    response = await call()
  }
  return response
}

export type DvsaFetchResult =
  | { status: "ok"; data: RegLookupData }
  | { status: "not-found" }
  | { status: "error" }

export async function fetchDvsaVehicle(reg: string): Promise<DvsaFetchResult> {
  try {
    const response = await fetchVehicle(reg)
    if (response.status === 404) return { status: "not-found" }
    if (!response.ok) {
      console.error("DVSA lookup failed:", response.status)
      return { status: "error" }
    }

    const v = (await response.json()) as DvsaVehicle
    const tests = [...(v.motTests ?? [])].sort(
      (a, b) => new Date(b.completedDate ?? 0).getTime() - new Date(a.completedDate ?? 0).getTime(),
    )

    // Latest recorded mileage, converted to miles if the test recorded km.
    const latest = tests.find((t) => t.odometerValue != null && Number(t.odometerValue) >= 0)
    let mileage = ""
    if (latest) {
      const value = Number(latest.odometerValue)
      mileage = String(latest.odometerUnit === "KM" ? Math.round(value * 0.621371) : Math.round(value))
    }

    const lastPass = tests.find((t) => t.testResult === "PASSED" && t.expiryDate)
    const yearSource = v.registrationDate || v.firstUsedDate || v.manufactureDate
    const year = yearSource ? yearSource.slice(0, 4) : ""

    return {
      status: "ok",
      data: {
        make: v.make ? titleCase(v.make) : "",
        model: v.model ? titleCase(v.model) : "",
        year: /^\d{4}$/.test(year) ? year : "",
        fuel: mapFuel(v.fuelType),
        colour: v.primaryColour ? titleCase(v.primaryColour) : "",
        motExpiry: lastPass?.expiryDate ?? v.motTestDueDate ?? "",
        engineSize: mapEngineSize(Number(v.engineSize)),
        mileage,
      },
    }
  } catch (error) {
    console.error("DVSA lookup error:", error)
    return { status: "error" }
  }
}
