import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { StockFilters } from "@/components/stock-filters"
import { VehicleGrid } from "@/components/vehicle-grid"
import { getPublicVehicles } from "@/lib/vehicles"
import { business } from "@/lib/business"
import type { VehicleType } from "@/lib/types"

export const metadata: Metadata = {
  title: `All Stock | ${business.name}`,
  description: `Browse every used car, van and commercial vehicle currently for sale at ${business.name} in ${business.address.town}.`,
}

interface StockPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    make?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams
  const vehicles = await getPublicVehicles()

  const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort()

  const filtered = vehicles.filter((vehicle) => {
    if (params.type && params.type !== "all" && vehicle.vehicleType !== (params.type as VehicleType)) return false
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">All stock</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {filtered.length} vehicle{filtered.length === 1 ? "" : "s"} available
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <StockFilters makes={makes} />
          </aside>
          <VehicleGrid vehicles={filtered} />
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
