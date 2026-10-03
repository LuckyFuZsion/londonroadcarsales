"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VEHICLE_TYPE_LABELS, type VehicleType } from "@/lib/types"
import { PUBLIC_STATUS_LABELS } from "@/lib/stock-filter"

interface StockFiltersProps {
  makes: string[]
  /** When set, the vehicle-type filter is hidden - the page already targets one type. */
  lockedType?: VehicleType
}

const PRICE_BANDS = [
  { label: "Any price", min: "", max: "" },
  { label: "Under £5,000", min: "", max: "5000" },
  { label: "£5,000 - £10,000", min: "5000", max: "10000" },
  { label: "£10,000 - £15,000", min: "10000", max: "15000" },
  { label: "Over £15,000", min: "15000", max: "" },
]

export function StockFilters({ makes, lockedType }: StockFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const q = searchParams.get("q") ?? ""
  const make = searchParams.get("make") ?? "all"
  const type = lockedType ?? (searchParams.get("type") ?? "all")
  const status = searchParams.get("status") ?? "all"
  const priceKey = `${searchParams.get("minPrice") ?? ""}-${searchParams.get("maxPrice") ?? ""}`

  const activeCount = useMemo(() => {
    let count = 0
    if (q) count++
    if (make !== "all") count++
    if (status !== "all") count++
    if (!lockedType && type !== "all") count++
    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) count++
    return count
  }, [q, make, status, type, lockedType, searchParams])

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams],
  )

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
    setOpen(false)
  }, [pathname, router])

  const content = (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="search" className="text-xs font-medium text-muted-foreground">
          Search
        </Label>
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Make, model or keyword"
            defaultValue={q}
            className="pl-9"
            onChange={(e) => updateParams({ q: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground">Availability</Label>
        <Select value={status} onValueChange={(value) => updateParams({ status: value ?? "all" })}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="All vehicles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vehicles</SelectItem>
            {Object.entries(PUBLIC_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!lockedType ? (
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Vehicle type</Label>
          <Select value={type} onValueChange={(value) => updateParams({ type: value ?? "all" })}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div>
        <Label className="text-xs font-medium text-muted-foreground">Make</Label>
        <Select value={make} onValueChange={(value) => updateParams({ make: value ?? "all" })}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="All makes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All makes</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground">Price</Label>
        <Select
          value={priceKey}
          onValueChange={(value) => {
            const band = PRICE_BANDS.find((b) => `${b.min}-${b.max}` === value)
            updateParams({ minPrice: band?.min ?? "", maxPrice: band?.max ?? "" })
          }}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Any price" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_BANDS.map((band) => (
              <SelectItem key={`${band.min}-${band.max}`} value={`${band.min}-${band.max}`}>
                {band.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeCount > 0 ? (
        <Button variant="ghost" size="sm" onClick={clearAll} className="justify-start gap-1.5 px-0 text-muted-foreground">
          <X className="size-3.5" aria-hidden="true" />
          Clear filters
        </Button>
      ) : null}
    </div>
  )

  return (
    <>
      <div className="hidden rounded-lg border border-border bg-card p-5 lg:block" aria-busy={isPending}>
        {content}
      </div>

      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="h-11 w-full gap-2 bg-card">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
                {activeCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    {activeCount}
                  </span>
                ) : null}
              </Button>
            }
          />
          <SheetContent side="left" className="w-[min(100%,20rem)] overflow-y-auto p-5 pt-6">
            <SheetTitle className="pr-10 text-left">Filter stock</SheetTitle>
            <div className="mt-6">{content}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
