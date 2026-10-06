import { business, formattedAddress } from "@/lib/business"
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
  const url = absoluteUrl("/")
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${url}/#dealer`,
    name: business.name,
    legalName: business.legalName.includes("[") ? business.name : business.legalName,
    url,
    image: absoluteUrl("/og-image.png"),
    logo: absoluteUrl("/logo.png"),
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
    knowsAbout: ["Used cars", "Used vans", "Commercial vehicles", "MOT", "Vehicle warranty"],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress())}`,
  }
}

/** WebPage + Speakable for the homepage (voice / assistant targeting). */
export function homePageJsonLd() {
  const url = absoluteUrl("/")
  const now = new Date().toISOString()
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url,
    name: `${business.name} | Used Cars & Vans in Grantham`,
    description: siteDescription(),
    isPartOf: {
      "@type": "WebSite",
      "@id": `${url}/#website`,
      name: business.name,
      url,
      publisher: { "@id": `${url}/#dealer` },
    },
    about: { "@id": `${url}/#dealer` },
    datePublished: "2025-01-01",
    dateModified: now,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".speakable-summary"],
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
    datePublished: vehicle.createdAt,
    dateModified: vehicle.updatedAt,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "GBP",
      price: vehicle.price,
      availability: offerAvailability(vehicle.status),
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@id": `${absoluteUrl("/")}/#dealer`,
        "@type": "AutoDealer",
        name: business.name,
        url: absoluteUrl("/"),
      },
    },
  }
}

/**
 * Meta description for search results. Keep under 160 characters so Google
 * does not truncate the snippet.
 */
export function siteDescription() {
  return "Affordable used cars, vans and commercials in Grantham. 12 months MOT, full service and in-house warranty on every vehicle."
}
