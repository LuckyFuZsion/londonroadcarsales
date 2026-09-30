import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { HomeHero } from "@/components/home-hero"
import { UspStrip } from "@/components/usp-strip"
import { VehicleTypeLinks } from "@/components/vehicle-type-links"
import { FeaturedVehicles } from "@/components/featured-vehicles"
import { CtaSection } from "@/components/cta-section"

// Stock comes from Firestore. Admin changes revalidate this page immediately;
// the interval is a safety net.
export const revalidate = 3600

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero />
        <UspStrip />
        <VehicleTypeLinks />
        <FeaturedVehicles />
        <CtaSection />
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
