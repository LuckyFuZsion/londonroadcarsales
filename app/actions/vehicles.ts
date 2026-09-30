"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { createVehicle, deleteVehicle, getVehicleByIdAdmin, updateVehicle } from "@/lib/vehicles"
import { vehicleFormSchema } from "@/lib/validations/vehicle"
import type { VehicleStatus } from "@/lib/types"

export interface VehicleActionResult {
  ok: boolean
  error?: string
  id?: string
}

/** Raw values as they come from the admin form: everything is a string until parsed. */
export interface VehicleFormInput {
  status: string
  vehicleType: string
  reg: string
  make: string
  model: string
  variant: string
  year: string
  mileage: string
  price: string
  vatStatus: string
  fuel: string
  transmission: string
  bodyType: string
  colour: string
  doors: string
  seats: string
  engineSize: string
  owners: string
  motExpiry: string
  description: string
  features: string
}

const vehicleDetailsSchema = vehicleFormSchema.omit({ images: true })

function blankToNull(value: unknown) {
  const text = typeof value === "string" ? value.trim() : ""
  return text === "" ? null : text
}

function revalidateSite(slug?: string) {
  revalidatePath("/")
  revalidatePath("/stock")
  revalidatePath("/used-cars-grantham")
  revalidatePath("/used-vans-grantham")
  revalidatePath("/commercial-vehicles-lincolnshire")
  revalidatePath("/sitemap.xml")
  revalidatePath("/admin")
  if (slug) revalidatePath(`/stock/${slug}`)
  else revalidatePath("/stock/[slug]", "page")
}

function parseInput(input: VehicleFormInput) {
  const features = String(input.features ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return vehicleDetailsSchema.safeParse({
    status: input.status,
    vehicleType: input.vehicleType,
    reg: String(input.reg ?? "").toUpperCase(),
    make: input.make,
    model: input.model,
    variant: input.variant,
    year: input.year,
    mileage: input.mileage,
    price: input.price,
    vatStatus: blankToNull(input.vatStatus),
    fuel: input.fuel,
    transmission: input.transmission,
    bodyType: input.bodyType,
    colour: input.colour,
    doors: blankToNull(input.doors),
    seats: blankToNull(input.seats),
    engineSize: input.engineSize,
    owners: blankToNull(input.owners),
    motExpiry: blankToNull(input.motExpiry),
    description: input.description,
    features,
  })
}

/** Creates (id = null) or updates a vehicle. Existing photos are left untouched on update. */
export async function saveVehicle(id: string | null, input: VehicleFormInput): Promise<VehicleActionResult> {
  await requireAdmin()

  const parsed = parseInput(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const field = issue?.path[0] ? `${String(issue.path[0])}: ` : ""
    return { ok: false, error: `${field}${issue?.message ?? "Please check the form and try again."}` }
  }

  try {
    if (id) {
      const existing = await getVehicleByIdAdmin(id)
      if (!existing) return { ok: false, error: "Vehicle not found." }
      await updateVehicle(id, parsed.data)
      revalidateSite(existing.slug)
      return { ok: true, id }
    }

    const newId = await createVehicle({ ...parsed.data, images: [] })
    revalidateSite()
    return { ok: true, id: newId }
  } catch (error) {
    console.error("[vehicles] Failed to save vehicle:", error)
    return { ok: false, error: "Could not save the vehicle. Please try again." }
  }
}

export async function setVehicleStatus(id: string, status: VehicleStatus): Promise<VehicleActionResult> {
  await requireAdmin()

  if (!["draft", "available", "reserved", "sold"].includes(status)) {
    return { ok: false, error: "Invalid status." }
  }

  try {
    const existing = await getVehicleByIdAdmin(id)
    if (!existing) return { ok: false, error: "Vehicle not found." }
    await updateVehicle(id, { status })
    revalidateSite(existing.slug)
    return { ok: true, id }
  } catch (error) {
    console.error("[vehicles] Failed to change status:", error)
    return { ok: false, error: "Could not change the status. Please try again." }
  }
}

export async function removeVehicle(id: string): Promise<VehicleActionResult> {
  await requireAdmin()

  try {
    const existing = await getVehicleByIdAdmin(id)
    if (!existing) return { ok: false, error: "Vehicle not found." }
    await deleteVehicle(id)
    revalidateSite(existing.slug)
    return { ok: true }
  } catch (error) {
    console.error("[vehicles] Failed to delete vehicle:", error)
    return { ok: false, error: "Could not delete the vehicle. Please try again." }
  }
}
