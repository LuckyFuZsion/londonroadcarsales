import "server-only"
import { cloudinaryCloudName } from "@/lib/cloudinary"

export function isCloudinaryConfigured() {
  return Boolean(
    cloudinaryCloudName() && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  )
}
