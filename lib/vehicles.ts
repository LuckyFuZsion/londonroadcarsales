import "server-only"
import { isFirebaseAdminConfigured, adminDb, assertFirebaseConfiguredInProduction } from "@/lib/firebase/admin"
import { mockVehicles } from "@/lib/mock-data"
import type { Vehicle, PublicVehicle } from "@/lib/types"
import { toPublicVehicle } from "@/lib/types"

const COLLECTION = "vehicles"

export function isLiveDataConfigured() {
  return isFirebaseAdminConfigured()
}

function sortByNewest(vehicles: Vehicle[]) {
  return [...vehicles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

async function readAllVehicles(): Promise<Vehicle[]> {
  assertFirebaseConfiguredInProduction()
  if (!isFirebaseAdminConfigured()) {
    return sortByNewest(mockVehicles)
  }

  const snapshot = await adminDb().collection(COLLECTION).get()
  const vehicles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Vehicle)
  return sortByNewest(vehicles)
}

/** All non-draft vehicles, with the registration plate stripped out. */
export async function getPublicVehicles(): Promise<PublicVehicle[]> {
  const vehicles = await readAllVehicles()
  return vehicles.filter((v) => v.status !== "draft").map(toPublicVehicle)
}

export async function getAvailableVehicles(limit?: number): Promise<PublicVehicle[]> {
  const vehicles = await getPublicVehicles()
  const available = vehicles.filter((v) => v.status === "available")
  return typeof limit === "number" ? available.slice(0, limit) : available
}

export async function getPublicVehicleBySlug(slug: string): Promise<PublicVehicle | null> {
  const vehicles = await getPublicVehicles()
  return vehicles.find((v) => v.slug === slug) ?? null
}

/** Includes drafts and the registration plate - admin use only. */
export async function getAllVehiclesAdmin(): Promise<Vehicle[]> {
  return readAllVehicles()
}

export async function getVehicleByIdAdmin(id: string): Promise<Vehicle | null> {
  assertFirebaseConfiguredInProduction()
  if (!isFirebaseAdminConfigured()) {
    return mockVehicles.find((v) => v.id === id) ?? null
  }

  const doc = await adminDb().collection(COLLECTION).doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Vehicle
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function generateSlug(vehicle: Pick<Vehicle, "year" | "make" | "model">) {
  const base = slugify(`${vehicle.year}-${vehicle.make}-${vehicle.model}-grantham`)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

function assertLiveDataConfigured() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase isn't connected yet, so stock can't be saved. Connect Firebase in the project's integrations to enable admin editing.",
    )
  }
}

export async function createVehicle(data: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "slug" | "soldAt">) {
  assertLiveDataConfigured()

  const now = new Date().toISOString()
  const slug = generateSlug(data)
  const soldAt = data.status === "sold" ? now : null

  const ref = await adminDb()
    .collection(COLLECTION)
    .add({ ...data, slug, soldAt, createdAt: now, updatedAt: now })

  return ref.id
}

export async function updateVehicle(
  id: string,
  data: Partial<Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "slug">>,
) {
  assertLiveDataConfigured()

  const existing = await getVehicleByIdAdmin(id)
  if (!existing) throw new Error("Vehicle not found.")

  const now = new Date().toISOString()
  const nextStatus = data.status ?? existing.status
  const soldAt = nextStatus === "sold" ? (existing.soldAt ?? now) : null

  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ ...data, soldAt, updatedAt: now })
}

export async function deleteVehicle(id: string) {
  assertLiveDataConfigured()
  await adminDb().collection(COLLECTION).doc(id).delete()
}
