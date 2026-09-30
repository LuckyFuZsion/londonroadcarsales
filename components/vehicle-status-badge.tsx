import { cn } from "@/lib/utils"
import type { VehicleStatus } from "@/lib/types"

const labels: Record<VehicleStatus, string> = {
  draft: "Draft",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
}

const styles: Record<VehicleStatus, string> = {
  draft: "bg-secondary text-secondary-foreground",
  available: "bg-success text-success-foreground",
  reserved: "bg-accent text-accent-foreground",
  sold: "bg-destructive text-destructive-foreground",
}

export function VehicleStatusBadge({ status, className }: { status: VehicleStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  )
}
