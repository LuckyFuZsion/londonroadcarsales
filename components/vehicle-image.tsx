import Image from "next/image"
import { CldImage } from "next-cloudinary"
import { isCloudinaryPublicId } from "@/lib/cloudinary"
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
 * Renders a vehicle photo. Real Cloudinary uploads go through next-cloudinary
 * (resized and format-converted by Cloudinary's CDN); local /public paths, such
 * as the sample stock, fall back to a plain next/image.
 */
export function VehicleImage({ image, alt, sizes, priority, fill = true, className }: VehicleImageProps) {
  if (isCloudinaryPublicId(image.publicId)) {
    return fill ? (
      <CldImage
        src={image.publicId}
        alt={alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
        className={className}
        priority={priority}
      />
    ) : (
      <CldImage
        src={image.publicId}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        className={className}
        priority={priority}
      />
    )
  }

  const src = image.publicId || "/placeholder.svg"

  if (fill) {
    return (
      <Image
        src={src}
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
      src={src}
      alt={alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  )
}
