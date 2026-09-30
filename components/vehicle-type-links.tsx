import Link from "next/link"
import { Car, Truck, Container } from "lucide-react"

const types = [
  { type: "car", label: "Cars", description: "Hatchbacks, saloons & SUVs", icon: Car },
  { type: "van", label: "Vans", description: "Panel vans & Lutons", icon: Truck },
  { type: "commercial", label: "Commercial", description: "Pickups & specialist vehicles", icon: Container },
] as const

export function VehicleTypeLinks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {types.map(({ type, label, description, icon: Icon }) => (
          <Link
            key={type}
            href={`/stock?type=${type}`}
            className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
