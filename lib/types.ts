export type VehicleStatus = "draft" | "available" | "reserved" | "sold"
export type VehicleType = "car" | "van" | "commercial"
export type VatStatus = "inc" | "ex" | "none"

export interface VehicleImage {
  publicId: string
  width: number
  height: number
}

export interface Vehicle {
  id: string
  slug: string
  status: VehicleStatus
  vehicleType: VehicleType
  /** Registration plate - admin only, never sent to public pages/components. */
  reg: string
  make: string
  model: string
  variant: string
  year: number
  mileage: number
  price: number
  vatStatus: VatStatus | null
  fuel: string
  transmission: string
  bodyType: string
  colour: string
  doors: number | null
  seats: number | null
  engineSize: string
  owners: number | null
  motExpiry: string | null
  description: string
  features: string[]
  images: VehicleImage[]
  createdAt: string
  updatedAt: string
  soldAt: string | null
}

/** Public-safe vehicle - never includes the registration plate. */
export type PublicVehicle = Omit<Vehicle, "reg">

/**
 * Firestore docs can be partial (e.g. created before images/features were set).
 * Normalise so public/admin UI never crashes on undefined arrays.
 */
export function normalizeVehicle(raw: Record<string, unknown> & { id: string }): Vehicle {
  const images = Array.isArray(raw.images)
    ? raw.images.filter(
        (image): image is VehicleImage =>
          Boolean(image) &&
          typeof image === "object" &&
          typeof (image as VehicleImage).publicId === "string",
      )
    : []

  const features = Array.isArray(raw.features)
    ? raw.features.filter((feature): feature is string => typeof feature === "string")
    : []

  const now = new Date().toISOString()

  return {
    id: raw.id,
    slug: typeof raw.slug === "string" ? raw.slug : raw.id,
    status: (raw.status as VehicleStatus) || "draft",
    vehicleType: (raw.vehicleType as VehicleType) || "car",
    reg: typeof raw.reg === "string" ? raw.reg : "",
    make: typeof raw.make === "string" ? raw.make : "",
    model: typeof raw.model === "string" ? raw.model : "",
    variant: typeof raw.variant === "string" ? raw.variant : "",
    year: typeof raw.year === "number" ? raw.year : 0,
    mileage: typeof raw.mileage === "number" ? raw.mileage : 0,
    price: typeof raw.price === "number" ? raw.price : 0,
    vatStatus: (raw.vatStatus as VatStatus | null) ?? null,
    fuel: typeof raw.fuel === "string" ? raw.fuel : "",
    transmission: typeof raw.transmission === "string" ? raw.transmission : "",
    bodyType: typeof raw.bodyType === "string" ? raw.bodyType : "",
    colour: typeof raw.colour === "string" ? raw.colour : "",
    doors: typeof raw.doors === "number" ? raw.doors : null,
    seats: typeof raw.seats === "number" ? raw.seats : null,
    engineSize: typeof raw.engineSize === "string" ? raw.engineSize : "",
    owners: typeof raw.owners === "number" ? raw.owners : null,
    motExpiry: typeof raw.motExpiry === "string" ? raw.motExpiry : null,
    description: typeof raw.description === "string" ? raw.description : "",
    features,
    images,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
    soldAt: typeof raw.soldAt === "string" ? raw.soldAt : null,
  }
}

export function toPublicVehicle(vehicle: Vehicle): PublicVehicle {
  const { reg: _reg, ...rest } = vehicle
  return rest
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  car: "Cars",
  van: "Vans",
  commercial: "Commercial Vehicles",
}

export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"] as const
export const TRANSMISSIONS = ["Manual", "Automatic"] as const
export const BODY_TYPES = [
  "Hatchback",
  "Saloon",
  "Estate",
  "SUV",
  "Coupe",
  "Convertible",
  "Panel Van",
  "Luton Van",
  "Dropside",
  "Tipper",
  "Pickup",
  "Minibus",
] as const
