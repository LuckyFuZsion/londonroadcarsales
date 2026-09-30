import Link from "next/link"
import Image from "next/image"
import { Phone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { business } from "@/lib/business"

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="absolute inset-0">
        <Image
          src="/vehicles/ranger/1.png"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          12 months MOT &middot; Full service &middot; In-house warranty
        </div>

        <div className="max-w-2xl">
          <h1 className="text-balance font-heading text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            {business.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            Family-run in Grantham, {business.name} sources honest, ready-to-drive vehicles at prices that make
            sense. Every one comes prepared and backed by our own warranty.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            render={<Link href="/stock">View current stock</Link>}
          />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
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
