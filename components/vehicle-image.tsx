import Image from "next/image"
import { isCloudinaryPublicId, cloudinaryCloudName } from "@/lib/cloudinary"
import type { VehicleImage as VehicleImageType } from "@/lib/types"

interface VehicleImageProps {
  image: VehicleImageType
  alt: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  className?: string
}

/**
 * Renders a vehicle photo. Uses Cloudinary's fetch URL format for real
 * Cloudinary public IDs, and falls back to a plain next/image for the local
 * /public paths used by the mock stock.
 */
export function VehicleImage({ image, alt, sizes, priority, fill = true, className }: VehicleImageProps) {
  const src = isCloudinaryPublicId(image.publicId)
    ? `https://res.cloudinary.com/${cloudinaryCloudName()}/image/upload/f_auto,q_auto/${image.publicId}`
    : image.publicId

  if (fill) {
    return (
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
        className={className}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  )
}
