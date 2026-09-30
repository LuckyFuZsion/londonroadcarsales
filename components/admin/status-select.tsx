"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { setVehicleStatus } from "@/app/actions/vehicles"
import type { VehicleStatus } from "@/lib/types"

const OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
]

export function StatusSelect({ id, status }: { id: string; status: VehicleStatus }) {
  const [pending, startTransition] = useTransition()

  function handleChange(next: VehicleStatus) {
    startTransition(async () => {
      const result = await setVehicleStatus(id, next)
      if (result.ok) toast.success("Status updated")
      else toast.error(result.error ?? "Could not change the status.")
    })
  }

  return (
    <select
      aria-label="Vehicle status"
      value={status}
      disabled={pending}
      onChange={(event) => handleChange(event.target.value as VehicleStatus)}
      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
