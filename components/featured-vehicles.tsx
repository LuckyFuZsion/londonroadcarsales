import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { VehicleCard } from "@/components/vehicle-card"
import { Button } from "@/components/ui/button"
import { getAvailableVehicles } from "@/lib/vehicles"

export async function FeaturedVehicles() {
  const vehicles = await getAvailableVehicles(6)

  if (vehicles.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Latest arrivals</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hand-picked, prepared and ready to drive away.</p>
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
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  )
}
