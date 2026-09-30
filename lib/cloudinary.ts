/**
 * Browser-safe Cloudinary helpers. Nothing secret lives here: anything that
 * needs CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET belongs in
 * lib/cloudinary-server.ts.
 */
export function cloudinaryCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? null
}

/** A publicId is a real Cloudinary asset if it doesn't look like a local /public path. */
export function isCloudinaryPublicId(publicId: string) {
  return Boolean(cloudinaryCloudName()) && !publicId.startsWith("/") && !publicId.startsWith("http")
}
