"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin", label: "Stock" },
  { href: "/admin/info", label: "Information" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
        {links.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/vehicles") : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center border-b-2 px-3 text-sm font-medium",
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
