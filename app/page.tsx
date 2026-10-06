import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { HomeHero } from "@/components/home-hero"
import { UspStrip } from "@/components/usp-strip"
import { VehicleTypeLinks } from "@/components/vehicle-type-links"
import { FeaturedVehicles } from "@/components/featured-vehicles"
import { HomeFaq, homeFaqJsonLd } from "@/components/home-faq"
import { CtaSection } from "@/components/cta-section"
import { JsonLd } from "@/components/json-ld"
import { homePageJsonLd } from "@/lib/seo"

// Stock comes from Firestore. Admin changes revalidate this page immediately;
// the interval is a safety net.
export const revalidate = 3600

type HomePageProps = {
  searchParams: Promise<{ page?: string | string[] }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams

  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero />
        <UspStrip />
        <VehicleTypeLinks />
        <FeaturedVehicles searchParams={params} />
        <HomeFaq />
        <CtaSection />
      </main>
      <SiteFooter />
      <ContactActions />
      <JsonLd data={[homePageJsonLd(), homeFaqJsonLd()]} />
    </>
  )
}
