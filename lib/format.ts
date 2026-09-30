import type { PublicVehicle } from "@/lib/types"

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
})

export function formatPrice(price: number, vatStatus: PublicVehicle["vatStatus"]) {
  const base = gbp.format(price)
  if (vatStatus === "ex") return `${base} + VAT`
  if (vatStatus === "inc") return `${base} inc. VAT`
  return base
}

export function formatMileage(mileage: number) {
  return `${new Intl.NumberFormat("en-GB").format(mileage)} miles`
}

export function vehicleTitle(vehicle: Pick<PublicVehicle, "year" | "make" | "model" | "variant">) {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""}`
}

export function formatMotExpiry(motExpiry: string | null) {
  if (!motExpiry) return "Not supplied"
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(motExpiry),
  )
}
