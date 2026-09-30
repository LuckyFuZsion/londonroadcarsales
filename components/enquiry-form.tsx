"use client"

import { useState, type FormEvent } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitEnquiry } from "@/app/actions/enquiry"

interface EnquiryFormProps {
  vehicleSlug?: string
  vehicleTitle?: string
  className?: string
}

export function EnquiryForm({ vehicleSlug, vehicleTitle, className }: EnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    setError("")

    const form = new FormData(event.currentTarget)

    const result = await submitEnquiry({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
      vehicleSlug: vehicleSlug ?? "",
      vehicleTitle: vehicleTitle ?? "",
      company: String(form.get("company") ?? ""),
    })

    if (result.ok) {
      setStatus("success")
      event.currentTarget.reset()
    } else {
      setStatus("error")
      setError(result.error ?? "Something went wrong. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div className={className}>
        <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Thanks - your enquiry is on its way</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll get back to you shortly. For anything urgent, give us a call.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {/* Honeypot - hidden from real visitors, catches simple bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {vehicleTitle ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Enquiring about: <span className="font-medium text-foreground">{vehicleTitle}</span>
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required className="mt-1.5" autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" className="mt-1.5" autoComplete="tel" />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1.5" autoComplete="email" />
      </div>

      <div className="mt-4">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          className="mt-1.5"
          defaultValue={vehicleTitle ? `Hi, I'm interested in the ${vehicleTitle}. Is it still available?` : ""}
        />
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={status === "submitting"} className="mt-5 w-full sm:w-auto">
        {status === "submitting" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Send enquiry
      </Button>
    </form>
  )
}
