"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { createVehicle, deleteVehicle, getVehicleByIdAdmin, updateVehicle } from "@/lib/vehicles"
import { vehicleFormSchema, vehicleImageSchema } from "@/lib/validations/vehicle"
import {
  deleteCloudinaryImage,
  deleteVehicleFolder,
  isCloudinaryConfigured,
  isValidVehicleId,
  vehicleFolder,
} from "@/lib/cloudinary-server"
import type { VehicleImage, VehicleStatus } from "@/lib/types"

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
    if (isCloudinaryConfigured() && isValidVehicleId(id)) await deleteVehicleFolder(id)
    await deleteVehicle(id)
    revalidateSite(existing.slug)
    return { ok: true }
  } catch (error) {
    console.error("[vehicles] Failed to delete vehicle:", error)
    return { ok: false, error: "Could not delete the vehicle. Please try again." }
  }
}

/** Appends photos that the browser has just uploaded to this vehicle's Cloudinary folder. */
export async function addVehicleImages(id: string, images: VehicleImage[]): Promise<VehicleActionResult> {
  await requireAdmin()

  const parsed = vehicleImageSchema.array().min(1).max(30).safeParse(images)
  if (!parsed.success) return { ok: false, error: "Invalid image details." }

  const prefix = `${vehicleFolder(id)}/`
  if (!isValidVehicleId(id) || parsed.data.some((image) => !image.publicId.startsWith(prefix))) {
    return { ok: false, error: "Image does not belong to this vehicle." }
  }

  try {
    const existing = await getVehicleByIdAdmin(id)
    if (!existing) return { ok: false, error: "Vehicle not found." }

    const known = new Set(existing.images.map((image) => image.publicId))
    const fresh = parsed.data.filter((image) => !known.has(image.publicId))
    await updateVehicle(id, { images: [...existing.images, ...fresh] })
    revalidateSite(existing.slug)
    return { ok: true, id }
  } catch (error) {
    console.error("[vehicles] Failed to add images:", error)
    return { ok: false, error: "Could not save the photos. Please try again." }
  }
}

/** Removes one photo from the vehicle and, if it is a Cloudinary upload, from Cloudinary too. */
export async function removeVehicleImage(id: string, publicId: string): Promise<VehicleActionResult> {
  await requireAdmin()

  try {
    const existing = await getVehicleByIdAdmin(id)
    if (!existing) return { ok: false, error: "Vehicle not found." }
    if (!existing.images.some((image) => image.publicId === publicId)) {
      return { ok: false, error: "Photo not found." }
    }

    if (isCloudinaryConfigured() && publicId.startsWith(`${vehicleFolder(id)}/`)) {
      await deleteCloudinaryImage(publicId)
    }

    await updateVehicle(id, { images: existing.images.filter((image) => image.publicId !== publicId) })
    revalidateSite(existing.slug)
    return { ok: true, id }
  } catch (error) {
    console.error("[vehicles] Failed to remove image:", error)
    return { ok: false, error: "Could not remove the photo. Please try again." }
  }
}

/** Saves a new photo order. The first photo is the cover image. */
export async function reorderVehicleImages(id: string, publicIds: string[]): Promise<VehicleActionResult> {
  await requireAdmin()

  try {
    const existing = await getVehicleByIdAdmin(id)
    if (!existing) return { ok: false, error: "Vehicle not found." }

    const byId = new Map(existing.images.map((image) => [image.publicId, image]))
    const ordered = publicIds
      .map((publicId) => byId.get(publicId))
      .filter((image): image is VehicleImage => Boolean(image))
    if (ordered.length !== existing.images.length) {
      return { ok: false, error: "Photo list is out of date. Reload and try again." }
    }

    await updateVehicle(id, { images: ordered })
    revalidateSite(existing.slug)
    return { ok: true, id }
  } catch (error) {
    console.error("[vehicles] Failed to reorder images:", error)
    return { ok: false, error: "Could not save the photo order. Please try again." }
  }
}
