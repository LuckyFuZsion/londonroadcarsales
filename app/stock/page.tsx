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
  title: "All stock",
  description: `Browse every used car, van and commercial vehicle currently for sale at ${business.name} in ${business.address.town}.`,
  ...canonicalMetadata("/stock"),
}

interface StockPageProps {
  searchParams: Promise<StockSearchParams>
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams
  const vehicles = await getPublicVehicles()

  const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort()

  const filtered = filterAndSortVehicles(vehicles, params)
  const availableCount = vehicles.filter((v) => v.status === "available").length

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">All stock</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {availableCount} vehicle{availableCount === 1 ? "" : "s"} available now, {filtered.length} shown
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
