import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { VehicleForm } from "@/components/admin/vehicle-form"
import { DeleteVehicleButton } from "@/components/admin/delete-vehicle-button"
import { getVehicleByIdAdmin } from "@/lib/vehicles"
import { vehicleTitle } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicleByIdAdmin(id)

  if (!vehicle) notFound()

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to stock
      </Link>
      <h1 className="mb-5 mt-2 font-heading text-2xl font-bold text-foreground">{vehicleTitle(vehicle)}</h1>
      <VehicleForm vehicle={vehicle} />
      <div className="mb-24 mt-2">
        <DeleteVehicleButton id={vehicle.id} title={vehicleTitle(vehicle)} />
      </div>
    </div>
  )
}
