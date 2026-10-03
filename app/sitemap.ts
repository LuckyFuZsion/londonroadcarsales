import type { MetadataRoute } from "next"
import { business } from "@/lib/business"
import { getPublicVehicles } from "@/lib/vehicles"
import { isSoldPastIndexWindow } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getPublicVehicles()

  const staticRoutes = [
    "",
    "/stock",
    "/used-cars-grantham",
    "/used-vans-grantham",
    "/commercial-vehicles-lincolnshire",
    "/warranty",
    "/about",
    "/contact",
    "/privacy",
    "/cookies",
    "/terms",
  ].map((path) => ({
    url: `${business.siteUrl}${path}`,
    lastModified: new Date(),
  }))

  const vehicleRoutes = vehicles
    .filter((vehicle) => !isSoldPastIndexWindow(vehicle))
    .map((vehicle) => ({
      url: `${business.siteUrl}/stock/${vehicle.slug}`,
      lastModified: new Date(vehicle.updatedAt),
    }))

  return [...staticRoutes, ...vehicleRoutes]
}
