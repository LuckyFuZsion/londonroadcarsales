import "server-only"
import { v2 as cloudinary } from "cloudinary"
import { cloudinaryCloudName } from "@/lib/cloudinary"

export function isCloudinaryConfigured() {
  return Boolean(
    cloudinaryCloudName() && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  )
}

function client() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    )
  }
  cloudinary.config({
    cloud_name: cloudinaryCloudName()!,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
  return cloudinary
}

/** Incoming transformation applied to every upload: never store anything wider than 2000px. */
export const UPLOAD_TRANSFORMATION = "c_limit,w_2000"
export const UPLOAD_ALLOWED_FORMATS = "jpg,jpeg,png,webp,heic,heif"

export function vehicleFolder(vehicleId: string) {
  return `vehicles/${vehicleId}`
}

/** Vehicle ids are Firestore auto ids; reject anything else before it reaches a folder path. */
export function isValidVehicleId(id: unknown): id is string {
  return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id)
}

/** Signs the exact parameter set the browser then sends to Cloudinary's upload endpoint. */
export function signVehicleUpload(vehicleId: string) {
  const c = client()
  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    allowed_formats: UPLOAD_ALLOWED_FORMATS,
    folder: vehicleFolder(vehicleId),
    timestamp,
    transformation: UPLOAD_TRANSFORMATION,
  }
  const signature = c.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

  return {
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: cloudinaryCloudName()!,
    ...params,
  }
}

/** Deletes a single uploaded asset. */
export async function deleteCloudinaryImage(publicId: string) {
  await client().uploader.destroy(publicId, { invalidate: true })
}

/** Deletes every image in a vehicle's folder, then the folder itself. */
export async function deleteVehicleFolder(vehicleId: string) {
  const c = client()
  const folder = vehicleFolder(vehicleId)
  await c.api.delete_resources_by_prefix(`${folder}/`, { invalidate: true })
  await c.api.delete_folder(folder).catch(() => {})
}
