import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { business } from "@/lib/business"
import { canonicalMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${business.name} collects, uses and protects your personal information.`,
  ...canonicalMetadata("/privacy"),
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Privacy policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2025</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">1. Who we are</h2>
            <p className="mt-2">
              {business.name}, {business.address.line1}, {business.address.town}, {business.address.county}{" "}
              {business.address.postcode} (&quot;we&quot;, &quot;us&quot;) is the data controller for personal
              information collected through this website.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">2. Information we collect</h2>
            <p className="mt-2">
              When you submit an enquiry form, we collect your name, email address, phone number (if provided) and
              the content of your message, along with which vehicle you enquired about.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">3. How we use your information</h2>
            <p className="mt-2">
              We use this information solely to respond to your enquiry, arrange viewings or test drives, and
              provide information about vehicles you&apos;ve expressed interest in. We do not sell or share your
              information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">4. Data retention</h2>
            <p className="mt-2">
              We retain enquiry records for as long as reasonably necessary to respond to your enquiry and for our
              legitimate business record-keeping, after which it is securely deleted.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">5. Your rights</h2>
            <p className="mt-2">
              Under UK GDPR, you have the right to access, correct or request deletion of your personal data. To
              exercise these rights, contact us at{" "}
              <a href={`mailto:${business.email}`} className="text-primary">
                {business.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">6. Contact us</h2>
            <p className="mt-2">
              If you have any questions about this policy, please call {business.phone.display} or email{" "}
              {business.email}.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
