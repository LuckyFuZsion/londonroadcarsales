import type { Metadata } from "next"
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { EnquiryForm } from "@/components/enquiry-form"
import { business, formattedAddress, hoursSummary } from "@/lib/business"

export const metadata: Metadata = {
  title: `Contact Us | ${business.name}`,
  description: `Get in touch with ${business.name} in Grantham - call, WhatsApp or send an enquiry about our used cars, vans and commercial vehicles.`,
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Questions about a vehicle, finance or part-exchange? We&apos;re here to help.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-heading text-lg font-bold text-foreground">Contact details</h2>
              <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <MapPin className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                  <span>{formattedAddress()}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                  <a href={business.phone.href} className="hover:text-foreground">
                    {business.phone.display}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                  <a href={`mailto:${business.email}`} className="break-all hover:text-foreground">
                    {business.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                  <span>{hoursSummary()}</span>
                </li>
              </ul>
              <a
                href={business.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Message us on WhatsApp
              </a>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                title={`Map showing ${business.name}`}
                src={`https://www.google.com/maps?q=${business.geo.latitude},${business.geo.longitude}&z=15&output=embed`}
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <h2 className="font-heading text-lg font-bold text-foreground">Send an enquiry</h2>
            <div className="mt-4">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
