import type { VehicleStatus } from "@/lib/types"

/**
 * Bold diagonal banner across the top-left corner of a vehicle photo. Only
 * shown for reserved and sold vehicles.
 */
export function VehicleStatusRibbon({ status }: { status: VehicleStatus }) {
  if (status !== "reserved" && status !== "sold") return null

  const isSold = status === "sold"

  return (
    <div className="pointer-events-none absolute left-0 top-0 size-40 overflow-hidden sm:size-44" aria-hidden="true">
      <span
        className={
          "absolute -left-[52px] top-[30px] w-[220px] -rotate-45 py-2 text-center text-lg font-extrabold uppercase tracking-[0.2em] shadow-lg sm:-left-[56px] sm:top-[34px] sm:text-xl " +
          (isSold ? "bg-destructive text-destructive-foreground" : "bg-amber-400 text-neutral-900")
        }
      >
        {isSold ? "Sold" : "Reserved"}
      </span>
    </div>
  )
}
