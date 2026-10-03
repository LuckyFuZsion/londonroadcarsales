import { ShieldCheck, Wrench, BadgeCheck, Banknote } from "lucide-react"

const items = [
  { icon: BadgeCheck, title: "12 months MOT", description: "On every vehicle we sell" },
  { icon: Wrench, title: "Full service", description: "Checked and serviced before sale" },
  { icon: ShieldCheck, title: "In-house warranty", description: "Comprehensive cover included" },
  {
    icon: Banknote,
    title: "Independent finance",
    description: "Arranged through an independent facility, subject to status",
  },
]

export function UspStrip() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <item.icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold leading-snug text-foreground">{item.title}</p>
              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
