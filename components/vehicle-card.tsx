import Link from "next/link"
import { Gauge, Fuel, Cog } from "lucide-react"
import { VehicleImage } from "@/components/vehicle-image"
import { VehicleStatusBadge } from "@/components/vehicle-status-badge"
import { VehicleStatusRibbon } from "@/components/vehicle-status-ribbon"
import { formatMileage, formatPrice, vehicleTitle } from "@/lib/format"
import type { PublicVehicle } from "@/lib/types"

export function VehicleCard({ vehicle }: { vehicle: PublicVehicle }) {
  const title = vehicleTitle(vehicle)
  const isSold = vehicle.status === "sold"

  return (
    <Link
      href={`/stock/${vehicle.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {vehicle.images[0] ? (
          <VehicleImage
            image={vehicle.images[0]}
            alt={title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {isSold ? <div className="absolute inset-0 bg-foreground/40" aria-hidden="true" /> : null}
        {vehicle.status === "available" ? (
          <VehicleStatusBadge status={vehicle.status} className="absolute left-3 top-3" />
        ) : (
          <VehicleStatusRibbon status={vehicle.status} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-balance font-sans text-base font-semibold leading-snug text-foreground">{title}</h3>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="size-3.5" aria-hidden="true" />
            {formatMileage(vehicle.mileage)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Fuel className="size-3.5" aria-hidden="true" />
            {vehicle.fuel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Cog className="size-3.5" aria-hidden="true" />
            {vehicle.transmission}
          </span>
        </div>

        <p className={"mt-auto text-lg font-bold " + (isSold ? "text-muted-foreground line-through" : "text-primary")}>
          {formatPrice(vehicle.price, vehicle.vatStatus)}
        </p>
      </div>
    </Link>
  )
}
