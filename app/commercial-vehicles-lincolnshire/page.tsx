import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { StockFilters } from "@/components/stock-filters"
import { VehicleGrid } from "@/components/vehicle-grid"
import { getPublicVehicles } from "@/lib/vehicles"
import { business } from "@/lib/business"
import { filterAndSortVehicles, type StockSearchParams } from "@/lib/stock-filter"
import { canonicalMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Commercial vehicles for sale in Lincolnshire",
  description: `Pickups, Lutons and commercial vehicles for sale across Lincolnshire. Every vehicle comes with 12 months MOT, a full service and our comprehensive in-house warranty.`,
  ...canonicalMetadata("/commercial-vehicles-lincolnshire"),
}

interface PageProps {
  searchParams: Promise<StockSearchParams>
}

export default async function CommercialVehiclesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const vehicles = await getPublicVehicles()
  const commercial = vehicles.filter((v) => v.vehicleType === "commercial")
  const makes = Array.from(new Set(commercial.map((v) => v.make))).sort()

  const filtered = filterAndSortVehicles(commercial, params)
  const availableCount = commercial.filter((v) => v.status === "available").length

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Commercial vehicles in Lincolnshire</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pickups, Lutons and work-ready commercials, supplied with 12 months MOT, a full service and our
            comprehensive in-house warranty - {availableCount} vehicle{availableCount === 1 ? "" : "s"} currently
            available.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <StockFilters makes={makes} lockedType="commercial" />
          </aside>
          <VehicleGrid vehicles={filtered} />
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
