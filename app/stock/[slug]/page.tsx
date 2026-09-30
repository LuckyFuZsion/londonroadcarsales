import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Gauge,
  Fuel,
  Cog,
  Calendar,
  Palette,
  DoorOpen,
  Users,
  Wrench,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { VehicleGallery } from "@/components/vehicle-gallery"
import { VehicleStatusBadge } from "@/components/vehicle-status-badge"
import { EnquiryForm } from "@/components/enquiry-form"
import { VehicleGrid } from "@/components/vehicle-grid"
import { getPublicVehicleBySlug, getPublicVehicles } from "@/lib/vehicles"
import { formatMileage, formatMotExpiry, formatPrice, vehicleTitle } from "@/lib/format"
import { business } from "@/lib/business"

interface VehiclePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getPublicVehicleBySlug(slug)
  if (!vehicle) return {}

  const title = vehicleTitle(vehicle)
  return {
    title: `${title} | ${business.name}`,
    description: vehicle.description,
    openGraph: {
      title,
      description: vehicle.description,
      images: vehicle.images[0] ? [{ url: vehicle.images[0].publicId }] : undefined,
    },
  }
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { slug } = await params
  const vehicle = await getPublicVehicleBySlug(slug)

  if (!vehicle) notFound()

  const title = vehicleTitle(vehicle)
  const isSold = vehicle.status === "sold"

  const allVehicles = await getPublicVehicles()
  const similar = allVehicles
    .filter((v) => v.id !== vehicle.id && v.vehicleType === vehicle.vehicleType && v.status === "available")
    .slice(0, 3)

  const specs = [
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
    { icon: Gauge, label: "Mileage", value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: "Fuel", value: vehicle.fuel },
    { icon: Cog, label: "Transmission", value: vehicle.transmission },
    { icon: Palette, label: "Colour", value: vehicle.colour },
    ...(vehicle.doors ? [{ icon: DoorOpen, label: "Doors", value: String(vehicle.doors) }] : []),
    ...(vehicle.seats ? [{ icon: Users, label: "Seats", value: String(vehicle.seats) }] : []),
    { icon: Wrench, label: "Engine", value: vehicle.engineSize },
  ]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/stock" className="hover:text-foreground">
            Stock
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="truncate text-foreground">{title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <VehicleGallery images={vehicle.images} alt={title} />

            <div className="mt-8">
              <h2 className="font-heading text-xl font-bold text-foreground">Description</h2>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{vehicle.description}</p>
            </div>

            <div className="mt-8">
              <h2 className="font-heading text-xl font-bold text-foreground">Specification</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded-lg border border-border bg-card p-3.5">
                    <spec.icon className="size-4 text-primary" aria-hidden="true" />
                    <p className="mt-2 text-xs text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-semibold text-foreground">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {vehicle.features.length > 0 ? (
              <div className="mt-8">
                <h2 className="font-heading text-xl font-bold text-foreground">Features</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BadgeCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-secondary p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Supplied with 12 months MOT & full service</p>
                <p className="mt-1">
                  MOT valid until {formatMotExpiry(vehicle.motExpiry)}, plus our comprehensive in-house warranty.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-balance font-heading text-2xl font-bold leading-tight text-foreground">
                    {title}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">{vehicle.bodyType}</p>
                </div>
                <VehicleStatusBadge status={vehicle.status} />
              </div>

              <p className="mt-4 text-3xl font-bold text-primary">{formatPrice(vehicle.price, vehicle.vatStatus)}</p>

              {isSold ? (
                <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  This vehicle has now sold. Get in touch - we may have something similar in stock.
                </p>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Interested? Send an enquiry below or call us to arrange a viewing.
                </p>
              )}

              <div className="mt-5 border-t border-border pt-5">
                <EnquiryForm vehicleSlug={vehicle.slug} vehicleTitle={title} />
              </div>
            </div>
          </div>
        </div>

        {similar.length > 0 ? (
          <div className="mt-14">
            <h2 className="font-heading text-2xl font-bold text-foreground">You might also like</h2>
            <div className="mt-5">
              <VehicleGrid vehicles={similar} />
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
