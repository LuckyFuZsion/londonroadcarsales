import type { MetadataRoute } from "next"
import { business } from "@/lib/business"
import { getPublicVehicles } from "@/lib/vehicles"

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

  const vehicleRoutes = vehicles.map((vehicle) => ({
    url: `${business.siteUrl}/stock/${vehicle.slug}`,
    lastModified: new Date(vehicle.updatedAt),
  }))

  return [...staticRoutes, ...vehicleRoutes]
}
