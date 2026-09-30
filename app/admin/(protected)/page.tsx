import Link from "next/link"
import { ExternalLink, Pencil, Plus } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { StatusSelect } from "@/components/admin/status-select"
import { getAllVehiclesAdmin } from "@/lib/vehicles"
import { formatMileage, formatPrice, vehicleTitle } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  const vehicles = await getAllVehiclesAdmin()

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Stock</h1>
          <p className="text-sm text-muted-foreground">
            {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}
          </p>
        </div>
        <Link href="/admin/vehicles/new" className={buttonVariants({ className: "h-11" })}>
          <Plus className="size-4" aria-hidden="true" />
          Add vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-medium text-foreground">No vehicles yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first vehicle to get started.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{vehicleTitle(vehicle)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {vehicle.reg} &middot; {formatMileage(vehicle.mileage)}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-primary">{formatPrice(vehicle.price, vehicle.vatStatus)}</p>
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
                <StatusSelect id={vehicle.id} status={vehicle.status} />
                <div className="flex gap-2">
                  <Link
                    href={`/admin/vehicles/${vehicle.id}`}
                    aria-label={`Edit ${vehicleTitle(vehicle)}`}
                    className={buttonVariants({ variant: "outline", className: "h-11" })}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </Link>
                  {vehicle.status !== "draft" ? (
                    <Link
                      href={`/stock/${vehicle.slug}`}
                      target="_blank"
                      aria-label="View on the website"
                      className={buttonVariants({ variant: "outline", className: "h-11 w-11 px-0" })}
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
