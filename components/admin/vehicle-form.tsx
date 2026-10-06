"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveVehicle, type VehicleFormInput } from "@/app/actions/vehicles"
import { lookupRegistration } from "@/app/actions/reg-lookup"
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, type Vehicle } from "@/lib/types"

const selectClass = "mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {" *"}
    </span>
  )
}

function Field({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function initialValues(vehicle?: Vehicle): VehicleFormInput {
  return {
    status: vehicle?.status ?? "draft",
    vehicleType: vehicle?.vehicleType ?? "car",
    reg: vehicle?.reg ?? "",
    make: vehicle?.make ?? "",
    model: vehicle?.model ?? "",
    variant: vehicle?.variant ?? "",
    year: vehicle ? String(vehicle.year) : "",
    mileage: vehicle ? String(vehicle.mileage) : "",
    price: vehicle ? String(vehicle.price) : "",
    vatStatus: vehicle?.vatStatus ?? "",
    fuel: vehicle?.fuel ?? "",
    transmission: vehicle?.transmission ?? "",
    bodyType: vehicle?.bodyType ?? "",
    colour: vehicle?.colour ?? "",
    doors: vehicle?.doors != null ? String(vehicle.doors) : "",
    seats: vehicle?.seats != null ? String(vehicle.seats) : "",
    engineSize: vehicle?.engineSize ?? "",
    owners: vehicle?.owners != null ? String(vehicle.owners) : "",
    motExpiry: vehicle?.motExpiry ?? "",
    description: vehicle?.description ?? "",
    features: vehicle?.features.join("\n") ?? "",
  }
}

export function VehicleForm({ vehicle, lookupEnabled = false }: { vehicle?: Vehicle; lookupEnabled?: boolean }) {
  const router = useRouter()
  const isNew = !vehicle
  const [values, setValues] = useState<VehicleFormInput>(() => initialValues(vehicle))
  const [submitting, setSubmitting] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [error, setError] = useState("")
  const required = isNew

  function set<K extends keyof VehicleFormInput>(key: K) {
    return (event: { target: { value: string } }) => setValues((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const needsVat = values.vehicleType !== "car"

  // Optional prefill from the registration. Only overwrites with values the lookup
  // actually returned, and never overwrites an existing mileage (the MOT figure is
  // the mileage at the last test, so it's only a starting point for a new vehicle).
  async function handleRegLookup() {
    if (!values.reg.trim()) {
      toast.error("Enter a registration first")
      return
    }

    setLookingUp(true)
    let result
    try {
      result = await lookupRegistration(values.reg)
    } catch {
      setLookingUp(false)
      toast.error("Lookup failed. You can still fill the details in by hand.")
      return
    }
    setLookingUp(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    const d = result.data
    setValues((prev) => ({
      ...prev,
      make: d.make || prev.make,
      model: d.model || prev.model,
      year: d.year || prev.year,
      fuel: d.fuel || prev.fuel,
      colour: d.colour || prev.colour,
      motExpiry: d.motExpiry || prev.motExpiry,
      engineSize: d.engineSize || prev.engineSize,
      mileage: prev.mileage || d.mileage,
    }))
    toast.success(`Details filled from ${result.source}. Check them and fill in the rest.`)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    const result = await saveVehicle(vehicle?.id ?? null, values)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? "Could not save the vehicle.")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    if (vehicle) {
      toast.success("Vehicle updated")
      router.push("/admin")
    } else {
      toast.success("Vehicle added. Now add some photos.")
      router.push(`/admin/vehicles/${result.id}`)
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24" noValidate>
      {error ? (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Section title="Listing">
        <Field label="Status" htmlFor="status">
          <select id="status" className={selectClass} value={values.status} onChange={set("status")}>
            <option value="draft">Draft (hidden from the site)</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </Field>
        <Field label="Vehicle type" htmlFor="vehicleType">
          <select id="vehicleType" className={selectClass} value={values.vehicleType} onChange={set("vehicleType")}>
            <option value="car">Car</option>
            <option value="van">Van</option>
            <option value="commercial">Commercial vehicle</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Label htmlFor="reg">
            Registration (never shown publicly)
            {required ? <RequiredMark /> : null}
          </Label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <Input
              id="reg"
              value={values.reg}
              onChange={set("reg")}
              autoCapitalize="characters"
              required={required}
              className="h-11 uppercase sm:flex-1"
            />
            {lookupEnabled ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                onClick={handleRegLookup}
                disabled={lookingUp || submitting}
              >
                {lookingUp ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="size-4" aria-hidden="true" />
                )}
                Fill from reg
              </Button>
            ) : null}
          </div>
          {lookupEnabled ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Fill from reg is optional. Fills in make, model, year, fuel, colour, engine size, mileage and MOT where it can. Everything stays editable.
            </p>
          ) : null}
        </div>
        <Field label="Price (£)" htmlFor="price" required={required}>
          <Input
            id="price"
            type="number"
            inputMode="numeric"
            min={0}
            required={required}
            value={values.price}
            onChange={set("price")}
            className="mt-1.5 h-11"
          />
        </Field>
        <Field label={needsVat ? "VAT status" : "VAT status (usually not needed for cars)"} htmlFor="vatStatus">
          <select id="vatStatus" className={selectClass} value={values.vatStatus} onChange={set("vatStatus")}>
            <option value="">No VAT shown</option>
            <option value="ex">Plus VAT</option>
            <option value="inc">Includes VAT</option>
            <option value="none">No VAT</option>
          </select>
        </Field>
      </Section>

      <Section title="Vehicle">
        <Field label="Make" htmlFor="make" required={required}>
          <Input id="make" required={required} value={values.make} onChange={set("make")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Model" htmlFor="model" required={required}>
          <Input id="model" required={required} value={values.model} onChange={set("model")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Variant / trim" htmlFor="variant">
          <Input id="variant" value={values.variant} onChange={set("variant")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Year" htmlFor="year" required={required}>
          <Input
            id="year"
            type="number"
            inputMode="numeric"
            required={required}
            value={values.year}
            onChange={set("year")}
            className="mt-1.5 h-11"
          />
        </Field>
        <Field label="Mileage" htmlFor="mileage" required={required}>
          <Input
            id="mileage"
            type="number"
            inputMode="numeric"
            min={0}
            required={required}
            value={values.mileage}
            onChange={set("mileage")}
            className="mt-1.5 h-11"
          />
        </Field>
        <Field label="Colour" htmlFor="colour" required={required}>
          <Input id="colour" required={required} value={values.colour} onChange={set("colour")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Fuel" htmlFor="fuel" required={required}>
          <select id="fuel" className={selectClass} required={required} value={values.fuel} onChange={set("fuel")}>
            <option value="">Choose...</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Transmission" htmlFor="transmission" required={required}>
          <select id="transmission" className={selectClass} required={required} value={values.transmission} onChange={set("transmission")}>
            <option value="">Choose...</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Body type" htmlFor="bodyType" required={required}>
          <select id="bodyType" className={selectClass} required={required} value={values.bodyType} onChange={set("bodyType")}>
            <option value="">Choose...</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Engine size (e.g. 2.0L)" htmlFor="engineSize">
          <Input id="engineSize" value={values.engineSize} onChange={set("engineSize")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Doors" htmlFor="doors">
          <Input id="doors" type="number" inputMode="numeric" min={0} value={values.doors} onChange={set("doors")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Seats" htmlFor="seats">
          <Input id="seats" type="number" inputMode="numeric" min={0} value={values.seats} onChange={set("seats")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Previous owners" htmlFor="owners">
          <Input id="owners" type="number" inputMode="numeric" min={0} value={values.owners} onChange={set("owners")} className="mt-1.5 h-11" />
        </Field>
        <Field label="MOT expiry" htmlFor="motExpiry">
          <Input id="motExpiry" type="date" value={values.motExpiry} onChange={set("motExpiry")} className="mt-1.5 h-11" />
        </Field>
      </Section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <h2 className="font-heading text-lg font-bold text-foreground">Description</h2>
        <div className="mt-4 space-y-4">
          <Field label="Description" htmlFor="description">
            <Textarea id="description" rows={6} value={values.description} onChange={set("description")} className="mt-1.5" />
          </Field>
          <Field label="Features (one per line)" htmlFor="features">
            <Textarea id="features" rows={6} value={values.features} onChange={set("features")} className="mt-1.5" />
          </Field>
        </div>
      </section>

      {isNew ? (
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive" aria-hidden="true">
            *
          </span>{" "}
          Required field. Photos can be added on the next screen, once the vehicle is saved.
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card p-3">
        <div className="mx-auto flex max-w-5xl gap-3">
          <Button type="button" variant="outline" className="h-12 flex-1 sm:flex-none sm:px-8" onClick={() => router.push("/admin")} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" className="h-12 flex-[2] sm:flex-none sm:px-10" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {vehicle ? "Save changes" : "Add vehicle"}
          </Button>
        </div>
      </div>
    </form>
  )
}
