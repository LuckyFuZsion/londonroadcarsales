import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { StockFilters } from "@/components/stock-filters"
import { VehicleGrid } from "@/components/vehicle-grid"
import { getPublicVehicles } from "@/lib/vehicles"
import { business } from "@/lib/business"
import { filterAndSortVehicles, type StockSearchParams } from "@/lib/stock-filter"

export const metadata: Metadata = {
  title: `Used Cars for Sale in Grantham | ${business.name}`,
  description: `Quality used cars for sale in Grantham, Lincolnshire. Every car comes with 12 months MOT, a full service and our comprehensive in-house warranty.`,
}

interface PageProps {
  searchParams: Promise<StockSearchParams>
}

export default async function UsedCarsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const vehicles = await getPublicVehicles()
  const cars = vehicles.filter((v) => v.vehicleType === "car")
  const makes = Array.from(new Set(cars.map((v) => v.make))).sort()

  const filtered = filterAndSortVehicles(cars, params)
  const availableCount = cars.filter((v) => v.status === "available").length

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Used cars in Grantham</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every car we sell is supplied with 12 months MOT, a full service and our comprehensive in-house
            warranty - {availableCount} car{availableCount === 1 ? "" : "s"} currently available.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <StockFilters makes={makes} lockedType="car" />
          </aside>
          <VehicleGrid vehicles={filtered} />
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
