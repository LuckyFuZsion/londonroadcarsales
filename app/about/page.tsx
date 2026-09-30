import type { Metadata } from "next"
import Image from "next/image"
import { MapPin, ShieldCheck, Users } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { business, formattedAddress } from "@/lib/business"

export const metadata: Metadata = {
  title: `About Us | ${business.name}`,
  description: `${business.name} is a family-run dealership on London Road, Grantham, selling quality used cars, vans and commercial vehicles across Lincolnshire.`,
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <Image
              src="/logo.png"
              alt={business.name}
              width={64}
              height={64}
              className="mx-auto size-16 rounded-lg"
            />
            <h1 className="mt-5 font-heading text-3xl font-bold text-foreground sm:text-4xl">About us</h1>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {business.name} is a family-run dealership based on London Road in Grantham, Lincolnshire. We sell
              honestly presented used cars, vans and commercial vehicles at fair prices - every one supplied with
              12 months MOT, a full service and our comprehensive in-house warranty.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <MapPin className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-heading text-base font-bold text-foreground">Local & independent</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Based at {formattedAddress()}, we&apos;re proud to serve customers across Grantham and the wider
                Lincolnshire area.
              </p>
            </div>
            <div>
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-heading text-base font-bold text-foreground">Honest, no-pressure sales</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We take the time to explain every vehicle&apos;s history and condition - no hard sell, just straight
                answers.
              </p>
            </div>
            <div>
              <Users className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-heading text-base font-bold text-foreground">Here after the sale</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our relationship doesn&apos;t end when you drive away. Our in-house warranty and friendly support
                mean we&apos;re only ever a phone call away.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-lg border border-border bg-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-foreground">Visit our forecourt</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pop in and see our current stock in person - no appointment necessary. We&apos;re open{" "}
              {business.hours[0].open}&ndash;{business.hours[0].close} Monday to Friday, and{" "}
              {business.hours[5].open}&ndash;{business.hours[5].close} on Saturdays.
            </p>
            <a
              href={business.phone.href}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Call {business.phone.display}
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
