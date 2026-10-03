import { business, formattedAddress, hoursSummary } from "@/lib/business"
import { cloudinaryCloudName, isCloudinaryPublicId } from "@/lib/cloudinary"
import { vehicleTitle } from "@/lib/format"
import type { PublicVehicle } from "@/lib/types"

const DAY_MS = 24 * 60 * 60 * 1000
export const SOLD_INDEX_WINDOW_DAYS = 30

/** Absolute URL for a site path (always non-www via business.siteUrl). */
export function absoluteUrl(path = "/") {
  const base = business.siteUrl.replace(/\/$/, "")
  if (!path || path === "/") return base
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export function canonicalMetadata(path = "/") {
  return { alternates: { canonical: absoluteUrl(path) } }
}

/** Absolute image URL for OG / JSON-LD. Never includes registration data. */
export function absoluteImageUrl(publicId: string | undefined | null) {
  if (!publicId) return absoluteUrl("/og-image.png")
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) return publicId
  if (publicId.startsWith("/")) return absoluteUrl(publicId)
  if (isCloudinaryPublicId(publicId)) {
    return `https://res.cloudinary.com/${cloudinaryCloudName()}/image/upload/f_auto,q_auto,w_1200/${publicId}`
  }
  return absoluteUrl("/og-image.png")
}

export function isSoldPastIndexWindow(vehicle: Pick<PublicVehicle, "status" | "soldAt">) {
  if (vehicle.status !== "sold" || !vehicle.soldAt) return false
  const soldAt = new Date(vehicle.soldAt).getTime()
  if (!Number.isFinite(soldAt)) return false
  return Date.now() - soldAt > SOLD_INDEX_WINDOW_DAYS * DAY_MS
}

function openingHoursSpecification() {
  return business.hours
    .filter((day) => day.open && day.close)
    .map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: day.day,
      opens: day.open,
      closes: day.close,
    }))
}

export function autoDealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: business.name,
    legalName: business.legalName.includes("[") ? business.name : business.legalName,
    url: absoluteUrl("/"),
    image: absoluteUrl("/og-image.png"),
    description: `${business.tagline}. Used cars, vans and commercial vehicles in ${business.address.town}.`,
    telephone: business.phone.display,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.line1,
      addressLocality: business.address.town,
      addressRegion: business.address.county,
      postalCode: business.address.postcode,
      addressCountry: business.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    openingHoursSpecification: openingHoursSpecification(),
    priceRange: "££",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Lincolnshire",
    },
  }
}

function offerAvailability(status: PublicVehicle["status"]) {
  if (status === "available") return "https://schema.org/InStock"
  if (status === "reserved") return "https://schema.org/LimitedAvailability"
  return "https://schema.org/SoldOut"
}

function vehicleSchemaType(vehicleType: PublicVehicle["vehicleType"]) {
  if (vehicleType === "car") return "Car"
  if (vehicleType === "van") return "Van"
  return "Vehicle"
}

export function vehicleJsonLd(vehicle: PublicVehicle) {
  const title = vehicleTitle(vehicle)
  const url = absoluteUrl(`/stock/${vehicle.slug}`)
  const images = vehicle.images.map((image) => absoluteImageUrl(image.publicId))

  return {
    "@context": "https://schema.org",
    "@type": vehicleSchemaType(vehicle.vehicleType),
    name: title,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "SMI",
    },
    fuelType: vehicle.fuel,
    vehicleTransmission: vehicle.transmission,
    color: vehicle.colour,
    bodyType: vehicle.bodyType,
    description: vehicle.description,
    image: images.length > 0 ? images : [absoluteUrl("/og-image.png")],
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "GBP",
      price: vehicle.price,
      availability: offerAvailability(vehicle.status),
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "AutoDealer",
        name: business.name,
        url: absoluteUrl("/"),
      },
    },
  }
}

/** Short British-English meta description helper. */
export function siteDescription() {
  return `${business.tagline}. Quality used cars, vans and commercial vehicles for sale in ${formattedAddress()}. 12 months MOT, full service and in-house warranty on every vehicle. ${hoursSummary()}.`
}
