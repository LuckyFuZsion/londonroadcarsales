import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { business } from "@/lib/business"
import { canonicalMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Cookie policy",
  description: `How ${business.name} uses cookies on this website.`,
  ...canonicalMetadata("/cookies"),
}

export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Cookie policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2025</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">What are cookies?</h2>
            <p className="mt-2">
              Cookies are small text files stored on your device that help websites function correctly and
              remember your preferences.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">Cookies we use</h2>
            <p className="mt-2">
              We use strictly necessary cookies for core site features, including the admin sign-in session on
              /admin pages. Stock filters may keep short-lived preferences in your browser.
            </p>
            <p className="mt-2">
              In production we also use Vercel Web Analytics to understand how the site is used. That product is
              designed to avoid personal advertising cookies. We do not run advertising or third-party marketing
              trackers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">Managing cookies</h2>
            <p className="mt-2">
              Most web browsers allow you to control cookies through their settings. Restricting cookies may impact
              some functionality of this website.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">Contact us</h2>
            <p className="mt-2">
              Questions about this policy? Email us at{" "}
              <a href={`mailto:${business.email}`} className="text-primary">
                {business.email}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
