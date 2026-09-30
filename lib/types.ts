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
