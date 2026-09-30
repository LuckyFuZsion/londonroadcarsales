"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveVehicle, type VehicleFormInput } from "@/app/actions/vehicles"
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, type Vehicle } from "@/lib/types"

const selectClass = "mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
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

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter()
  const [values, setValues] = useState<VehicleFormInput>(() => initialValues(vehicle))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  function set<K extends keyof VehicleFormInput>(key: K) {
    return (event: { target: { value: string } }) => setValues((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const needsVat = values.vehicleType !== "car"

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
        <Field label="Registration (never shown publicly)" htmlFor="reg">
          <Input id="reg" value={values.reg} onChange={set("reg")} autoCapitalize="characters" className="mt-1.5 h-11 uppercase" />
        </Field>
        <Field label="Price (£)" htmlFor="price">
          <Input id="price" type="number" inputMode="numeric" min={0} value={values.price} onChange={set("price")} className="mt-1.5 h-11" />
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
        <Field label="Make" htmlFor="make">
          <Input id="make" value={values.make} onChange={set("make")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Model" htmlFor="model">
          <Input id="model" value={values.model} onChange={set("model")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Variant / trim" htmlFor="variant">
          <Input id="variant" value={values.variant} onChange={set("variant")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Year" htmlFor="year">
          <Input id="year" type="number" inputMode="numeric" value={values.year} onChange={set("year")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Mileage" htmlFor="mileage">
          <Input id="mileage" type="number" inputMode="numeric" min={0} value={values.mileage} onChange={set("mileage")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Colour" htmlFor="colour">
          <Input id="colour" value={values.colour} onChange={set("colour")} className="mt-1.5 h-11" />
        </Field>
        <Field label="Fuel" htmlFor="fuel">
          <select id="fuel" className={selectClass} value={values.fuel} onChange={set("fuel")}>
            <option value="">Choose...</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Transmission" htmlFor="transmission">
          <select id="transmission" className={selectClass} value={values.transmission} onChange={set("transmission")}>
            <option value="">Choose...</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Body type" htmlFor="bodyType">
          <select id="bodyType" className={selectClass} value={values.bodyType} onChange={set("bodyType")}>
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

      <p className="text-sm text-muted-foreground">{vehicle ? "" : "Photos can be added on the next screen, once the vehicle is saved."}</p>

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
