import Link from "next/link"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { business } from "@/lib/business"

export function CtaSection() {
  return (
    <section className="border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Looking for something specific?
          </h2>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            New stock arrives every week. Tell us what you&apos;re after and we&apos;ll let you know as soon as it
            comes in - or call us directly for a chat.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/contact">Get in touch</Link>} />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="gap-2 bg-card"
            render={
              <a href={business.phone.href}>
                <Phone className="size-4" aria-hidden="true" />
                {business.phone.display}
              </a>
            }
          />
        </div>
      </div>
    </section>
  )
}
