import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { StockFilters } from "@/components/stock-filters"
import { VehicleGrid } from "@/components/vehicle-grid"
import { getPublicVehicles } from "@/lib/vehicles"
import { business } from "@/lib/business"

export const metadata: Metadata = {
  title: `Used Vans for Sale in Grantham | ${business.name}`,
  description: `Reliable used vans for sale in Grantham, Lincolnshire. Every van comes with 12 months MOT, a full service and our comprehensive in-house warranty.`,
}

interface PageProps {
  searchParams: Promise<{ q?: string; make?: string; minPrice?: string; maxPrice?: string }>
}

export default async function UsedVansPage({ searchParams }: PageProps) {
  const params = await searchParams
  const vehicles = await getPublicVehicles()
  const vans = vehicles.filter((v) => v.vehicleType === "van")
  const makes = Array.from(new Set(vans.map((v) => v.make))).sort()

  const filtered = vans.filter((vehicle) => {
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
          <h1 className="font-heading text-3xl font-bold text-foreground">Used vans in Grantham</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ready-to-work vans, supplied with 12 months MOT, a full service and our comprehensive in-house
            warranty - {filtered.length} van{filtered.length === 1 ? "" : "s"} currently in stock.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <StockFilters makes={makes} lockedType="van" />
          </aside>
          <VehicleGrid vehicles={filtered} />
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
