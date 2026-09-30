import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { VehicleCard } from "@/components/vehicle-card"
import { PaginationControls } from "@/components/pagination-controls"
import { Button } from "@/components/ui/button"
import { getAvailableVehicles } from "@/lib/vehicles"
import { HOME_STOCK_PAGE_SIZE, paginate, parsePage } from "@/lib/pagination"

type FeaturedVehiclesProps = {
  searchParams?: { page?: string | string[] }
}

export async function FeaturedVehicles({ searchParams }: FeaturedVehiclesProps = {}) {
  const vehicles = await getAvailableVehicles()
  if (vehicles.length === 0) return null

  const { items, currentPage, totalPages, total } = paginate(
    vehicles,
    parsePage(searchParams?.page),
    HOME_STOCK_PAGE_SIZE,
  )

  function hrefForPage(page: number) {
    if (page <= 1) return "/#latest-arrivals"
    return `/?page=${page}#latest-arrivals`
  }

  return (
    <section id="latest-arrivals" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Latest arrivals</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} vehicle{total === 1 ? "" : "s"} available now
            {totalPages > 1 ? ` · showing ${items.length} on this page` : null}
          </p>
        </div>
        <Button
          variant="ghost"
          className="gap-1.5"
          nativeButton={false}
          render={
            <Link href="/stock">
              View all stock
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      <PaginationControls
        className="mt-8"
        currentPage={currentPage}
        totalPages={totalPages}
        hrefForPage={hrefForPage}
      />
    </section>
  )
}
