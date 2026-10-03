import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { VehicleForm } from "@/components/admin/vehicle-form"
import { isDvlaConfigured } from "@/lib/dvla"

export default function NewVehiclePage() {
  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to stock
      </Link>
      <h1 className="mb-5 mt-2 font-heading text-2xl font-bold text-foreground">Add vehicle</h1>
      <VehicleForm dvlaEnabled={isDvlaConfigured()} />
    </div>
  )
}
