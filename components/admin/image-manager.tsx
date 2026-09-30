"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Camera, Loader2, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { addVehicleImages, removeVehicleImage, reorderVehicleImages } from "@/app/actions/vehicles"
import type { VehicleImage } from "@/lib/types"

const MAX_FILE_BYTES = 10 * 1024 * 1024
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function thumbUrl(image: VehicleImage) {
  if (image.publicId.startsWith("/") || image.publicId.startsWith("http") || !CLOUD_NAME) return image.publicId
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_400,h_300,f_auto,q_auto/${image.publicId}`
}

interface SignedUpload {
  signature: string
  apiKey: string
  cloudName: string
  timestamp: number
  folder: string
  transformation: string
  allowed_formats: string
}

async function uploadOne(file: File, vehicleId: string): Promise<VehicleImage> {
  const signResponse = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleId }),
  })
  if (!signResponse.ok) throw new Error("Could not start the upload.")
  const signed = (await signResponse.json()) as SignedUpload

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", signed.apiKey)
  form.append("timestamp", String(signed.timestamp))
  form.append("signature", signed.signature)
  form.append("folder", signed.folder)
  form.append("transformation", signed.transformation)
  form.append("allowed_formats", signed.allowed_formats)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  })
  if (!response.ok) throw new Error("Upload was rejected.")

  const result = (await response.json()) as { public_id: string; width: number; height: number }
  return { publicId: result.public_id, width: result.width, height: result.height }
}

export function ImageManager({ vehicleId, initialImages }: { vehicleId: string; initialImages: VehicleImage[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState(initialImages)
  const [progress, setProgress] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const busy = progress !== null || pending

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return

    const uploaded: VehicleImage[] = []
    for (const [index, file] of files.entries()) {
      setProgress(`Uploading ${index + 1} of ${files.length}...`)
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is over 10 MB and was skipped.`)
        continue
      }
      try {
        uploaded.push(await uploadOne(file, vehicleId))
      } catch {
        toast.error(`${file.name} failed to upload.`)
      }
    }

    if (uploaded.length > 0) {
      setProgress("Saving...")
      const result = await addVehicleImages(vehicleId, uploaded)
      if (result.ok) {
        setImages((prev) => [...prev, ...uploaded.filter((u) => !prev.some((p) => p.publicId === u.publicId))])
        toast.success(`${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} added`)
        router.refresh()
      } else {
        toast.error(result.error ?? "Could not save the photos.")
      }
    }

    setProgress(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    const previous = images
    setImages(next)
    startTransition(async () => {
      const result = await reorderVehicleImages(
        vehicleId,
        next.map((image) => image.publicId),
      )
      if (!result.ok) {
        setImages(previous)
        toast.error(result.error ?? "Could not save the photo order.")
      }
    })
  }

  function remove(publicId: string) {
    startTransition(async () => {
      const result = await removeVehicleImage(vehicleId, publicId)
      if (result.ok) {
        setImages((prev) => prev.filter((image) => image.publicId !== publicId))
        toast.success("Photo removed")
        router.refresh()
      } else {
        toast.error(result.error ?? "Could not remove the photo.")
      }
    })
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <h2 className="font-heading text-lg font-bold text-foreground">Photos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The first photo is the cover image. Photos save straight away, no need to press Save changes.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        id="photo-upload"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <Button
        type="button"
        className="mt-4 h-12 w-full sm:w-auto sm:px-8"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {progress ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Camera className="size-4" aria-hidden="true" />
        )}
        {progress ?? "Add photos"}
      </Button>

      {images.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No photos yet.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.publicId} className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="relative aspect-[4/3] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl(image)} alt={`Photo ${index + 1}`} className="size-full object-cover" />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                    <Star className="size-3" aria-hidden="true" />
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 px-0"
                  disabled={busy || index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label="Move earlier"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 px-0"
                  disabled={busy || index === images.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label="Move later"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 px-0 text-destructive"
                  disabled={busy}
                  onClick={() => remove(image.publicId)}
                  aria-label="Remove photo"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
