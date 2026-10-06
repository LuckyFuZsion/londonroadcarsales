import { FUEL_TYPES } from "@/lib/types"

/** Values used to prefill the admin vehicle form. Empty string = unknown. */
export interface RegLookupData {
  make: string
  model: string
  year: string
  fuel: string
  colour: string
  motExpiry: string
  engineSize: string
  mileage: string
}

export type RegLookupResult =
  | { ok: true; configured: true; source: "DVSA" | "DVLA"; data: RegLookupData }
  | { ok: false; configured: boolean; error: string }

const KEEP_UPPER = new Set(["BMW", "MG", "DS", "GT", "GTI", "GTD", "GTE", "RS", "ST", "SE", "SEL", "SUV", "TDI", "TSI", "CDTI", "AMG", "VXR", "LTZ", "SRI", "XC"])

export function titleCase(value: string) {
  return value
    .trim()
    .split(/(\s+|\/)/)
    .map((part) => {
      const upper = part.toUpperCase()
      if (!part.trim() || part === "/") return part
      if (KEEP_UPPER.has(upper) || /\d/.test(part)) return upper
      return part
        .split("-")
        .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase())
        .join("-")
    })
    .join("")
}

export function mapFuel(fuelType: string | undefined) {
  if (!fuelType) return ""
  const normalised = fuelType.trim().toUpperCase()
  if (normalised.includes("DIESEL")) return "Diesel"
  if (normalised.includes("ELECTRIC") && !normalised.includes("HYBRID")) return "Electric"
  if (normalised.includes("HYBRID")) return "Hybrid"
  if (normalised.includes("LPG")) return "LPG"
  if (normalised.includes("PETROL") || normalised.includes("GAS")) return "Petrol"

  const match = FUEL_TYPES.find((fuel) => fuel.toUpperCase() === normalised)
  return match ?? titleCase(fuelType)
}

export function mapEngineSize(cc: number | undefined) {
  if (!cc || !Number.isFinite(cc) || cc <= 0) return ""
  return `${(cc / 1000).toFixed(1)}L`
}

export function normaliseReg(reg: string) {
  return reg.replace(/[\s-]/g, "").toUpperCase()
}

export function isPlausibleReg(reg: string) {
  return /^[A-Z0-9]{2,8}$/.test(reg)
}
