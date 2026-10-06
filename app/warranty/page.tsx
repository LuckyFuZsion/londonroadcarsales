import type { Metadata } from "next"
import { ShieldCheck, Wrench, Clock, PhoneCall } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { business } from "@/lib/business"
import { canonicalMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Our warranty",
  description: `Every vehicle from ${business.name} comes with 12 months MOT, a full service and our comprehensive in-house warranty. Here is what is covered.`,
  ...canonicalMetadata("/warranty"),
}

const coverage = [
  {
    icon: ShieldCheck,
    title: "Comprehensive in-house warranty",
    body: "Every vehicle we sell is covered by our own in-house warranty from the day you drive away - no third-party claims process, no waiting on hold. If something goes wrong, you deal with us directly.",
  },
  {
    icon: Wrench,
    title: "Full service before collection",
    body: "Each vehicle is fully serviced before it reaches our forecourt, using quality parts and fluids, so you can drive away knowing it's been properly looked after.",
  },
  {
    icon: Clock,
    title: "12 months MOT included",
    body: "Every car, van and commercial vehicle is supplied with a fresh 12-month MOT as standard - one less thing to think about in your first year of ownership. You can also review MOT history yourself on the official GOV.UK check service.",
  },
  {
    icon: PhoneCall,
    title: "Ongoing support",
    body: "Questions after you've collected your vehicle? Give us a call. We're a small, local dealership and we look after our customers long after the sale.",
  },
]

export default function WarrantyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Peace of mind with every vehicle
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            We believe buying a used car, van or commercial vehicle should feel safe and straightforward. That&apos;s
            why every vehicle we sell comes with 12 months MOT, a full service and our comprehensive in-house
            warranty as standard - included in the price, not an optional extra.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {coverage.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-card p-6">
              <item.icon className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-secondary p-6 text-center">
          <h2 className="font-heading text-lg font-bold text-foreground">Got a question about cover?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Call us on{" "}
            <a href={business.phone.href} className="font-semibold text-primary">
              {business.phone.display}
            </a>{" "}
            and we&apos;ll happily talk you through exactly what&apos;s included. For official MOT history, use{" "}
            <a
              href="https://www.gov.uk/check-mot-history"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              GOV.UK Check MOT history
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
