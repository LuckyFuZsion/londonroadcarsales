import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { business } from "@/lib/business"

export const metadata: Metadata = {
  title: `Terms & Conditions | ${business.name}`,
  description: `Terms and conditions for using the ${business.name} website and purchasing vehicles from us.`,
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Terms & conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2025</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">1. Vehicle information</h2>
            <p className="mt-2">
              We take reasonable care to ensure vehicle descriptions, specifications, mileage and pricing on this
              website are accurate at the time of publishing. Details are provided for guidance only and should be
              confirmed at the point of viewing or purchase.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">2. Pricing</h2>
            <p className="mt-2">
              Prices are shown in GBP and, where indicated, are subject to VAT. Prices may change without notice
              and do not constitute a contractual offer until confirmed in writing.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">3. Warranty</h2>
            <p className="mt-2">
              Vehicles supplied by {business.name} include our comprehensive in-house warranty as described on our
              Warranty page. Full terms of cover are provided at the point of sale.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">4. Enquiries</h2>
            <p className="mt-2">
              Submitting an enquiry through this website does not reserve a vehicle. Vehicles are sold on a
              first-come, first-served basis until a deposit is taken.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">5. Contact us</h2>
            <p className="mt-2">
              For any questions about these terms, please contact us at {business.email} or{" "}
              {business.phone.display}.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
