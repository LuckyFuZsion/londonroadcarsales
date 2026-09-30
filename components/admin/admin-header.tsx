"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Home, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import { endAdminSession } from "@/app/actions/admin-auth"
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client"
import { cn } from "@/lib/utils"

export function AdminHeader({ email }: { email: string }) {
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await endAdminSession()
      if (isFirebaseClientConfigured()) {
        await signOut(getFirebaseAuth()).catch(() => {})
      }
      window.location.assign("/admin/login")
    })
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-foreground">London Road admin</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full sm:w-auto")}
            aria-label="Back to live site"
          >
            <Home className="size-4" aria-hidden="true" />
            Live site
          </Link>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={pending}
            className="h-11 w-full sm:w-auto"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
