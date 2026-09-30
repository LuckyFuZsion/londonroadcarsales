import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { business, formattedAddress, hoursSummary } from "@/lib/business"

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h2 className="font-sans text-lg font-bold text-foreground">{business.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{business.tagline}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              {business.usps.map((usp) => (
                <li key={usp} className="flex gap-2">
                  <span aria-hidden="true" className="text-primary">
                    &#8226;
                  </span>
                  {usp}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Browse stock</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/stock" className="hover:text-foreground">
                  All stock
                </Link>
              </li>
              <li>
                <Link href="/used-cars-grantham" className="hover:text-foreground">
                  Used cars in Grantham
                </Link>
              </li>
              <li>
                <Link href="/used-vans-grantham" className="hover:text-foreground">
                  Used vans in Grantham
                </Link>
              </li>
              <li>
                <Link href="/commercial-vehicles-lincolnshire" className="hover:text-foreground">
                  Commercial vehicles
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-foreground">
                  Our warranty
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground">
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms & conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Visit us</h3>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <MapPin className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                <span>{formattedAddress()}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                <a href={business.phone.href} className="hover:text-foreground">
                  {business.phone.display}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                <a href={`mailto:${business.email}`} className="break-all hover:text-foreground">
                  {business.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Clock className="size-4 shrink-0 translate-y-0.5 text-primary" aria-hidden="true" />
                <span>{hoursSummary()}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {business.name}. All rights reserved.
          </p>
          <a href={business.credit.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            {business.credit.label}
          </a>
        </div>
      </div>
    </footer>
  )
}
