import { VehicleCard } from "@/components/vehicle-card"
import type { PublicVehicle } from "@/lib/types"

export function VehicleGrid({ vehicles }: { vehicles: PublicVehicle[] }) {
  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No vehicles match your search right now. Try adjusting your filters, or get in touch - new stock arrives
          every week.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
