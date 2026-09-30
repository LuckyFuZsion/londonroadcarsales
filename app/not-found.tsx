import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactActions } from "@/components/contact-actions"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="font-heading text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, or that vehicle may have already sold.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/stock">Browse all stock</Link>} />
          <Button variant="outline" nativeButton={false} render={<Link href="/">Back to homepage</Link>} />
        </div>
      </main>
      <SiteFooter />
      <ContactActions />
    </>
  )
}
