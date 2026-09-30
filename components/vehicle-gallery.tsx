"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { VehicleImage } from "@/components/vehicle-image"
import { cn } from "@/lib/utils"
import type { VehicleImage as VehicleImageType } from "@/lib/types"

export function VehicleGallery({ images, alt }: { images: VehicleImageType[]; alt: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-lg bg-muted" />
  }

  const goTo = (index: number) => setActive((index + images.length) % images.length)

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <VehicleImage image={images[active]} alt={`${alt} - photo ${active + 1}`} priority className="object-cover" />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground">
              {active + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2.5 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={`${image.publicId}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View photo ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-md ring-2 ring-transparent transition-all",
                index === active && "ring-primary",
              )}
            >
              <VehicleImage image={image} alt="" sizes="15vw" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
