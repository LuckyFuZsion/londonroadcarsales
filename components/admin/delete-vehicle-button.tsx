"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { removeVehicle } from "@/app/actions/vehicles"

export function DeleteVehicleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await removeVehicle(id)
      if (result.ok) {
        toast.success("Vehicle deleted")
        router.push("/admin")
        router.refresh()
      } else {
        toast.error(result.error ?? "Could not delete the vehicle.")
        setConfirming(false)
      }
    })
  }

  if (!confirming) {
    return (
      <Button type="button" variant="outline" className="h-11 w-full text-destructive" onClick={() => setConfirming(true)}>
        <Trash2 className="size-4" aria-hidden="true" />
        Delete vehicle
      </Button>
    )
  }

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
      <p className="text-sm text-foreground">
        Delete <span className="font-semibold">{title}</span> permanently? This cannot be undone.
      </p>
      <div className="mt-3 flex gap-3">
        <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => setConfirming(false)} disabled={pending}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" className="h-11 flex-1" onClick={handleDelete} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Yes, delete
        </Button>
      </div>
    </div>
  )
}
