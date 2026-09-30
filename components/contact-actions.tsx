import { Phone, MessageCircle } from "lucide-react"
import { business } from "@/lib/business"

/** Sticky mobile call bar - hidden on desktop where the header buttons suffice. */
export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card md:hidden">
      <a
        href={business.phone.href}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-foreground"
      >
        <Phone className="size-4" aria-hidden="true" />
        Call us
      </a>
      <div className="w-px bg-border" />
      <a
        href={business.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        WhatsApp
      </a>
    </div>
  )
}

/** Convenience wrapper used on every page - renders the sticky mobile call/WhatsApp bar. */
export function ContactActions() {
  return <MobileContactBar />
}

export function HeaderContactButtons() {
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <a
        href={business.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        WhatsApp
      </a>
      <a
        href={business.phone.href}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Phone className="size-4" aria-hidden="true" />
        {business.phone.display}
      </a>
    </div>
  )
}
