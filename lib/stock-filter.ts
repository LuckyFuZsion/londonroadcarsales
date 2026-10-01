import type { PublicVehicle, VehicleStatus } from "@/lib/types"

export interface StockSearchParams {
  q?: string
  type?: string
  make?: string
  minPrice?: string
  maxPrice?: string
  status?: string
}

/** Statuses a visitor can filter by (drafts are never public). */
export const PUBLIC_STATUS_LABELS: Record<Exclude<VehicleStatus, "draft">, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
}

const STATUS_ORDER: Record<VehicleStatus, number> = { available: 0, reserved: 1, sold: 2, draft: 3 }

/**
 * Applies the stock page search params, then lists available vehicles first,
 * then reserved, then sold. Within each status the incoming (newest first)
 * order is kept.
 */
export function filterAndSortVehicles(vehicles: PublicVehicle[], params: StockSearchParams): PublicVehicle[] {
  const filtered = vehicles.filter((vehicle) => {
    if (params.type && params.type !== "all" && vehicle.vehicleType !== params.type) return false
    if (params.status && params.status !== "all" && vehicle.status !== params.status) return false
    if (params.make && params.make !== "all" && vehicle.make !== params.make) return false
    if (params.minPrice && vehicle.price < Number(params.minPrice)) return false
    if (params.maxPrice && vehicle.price > Number(params.maxPrice)) return false
    if (params.q) {
      const needle = params.q.toLowerCase()
      const haystack = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.bodyType}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  return filtered
    .map((vehicle, index) => ({ vehicle, index }))
    .sort(
      (a, b) =>
        (STATUS_ORDER[a.vehicle.status] ?? 99) - (STATUS_ORDER[b.vehicle.status] ?? 99) || a.index - b.index,
    )
    .map(({ vehicle }) => vehicle)
}
