"use client"

import { useTransition } from "react"
import { LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { endAdminSession } from "@/app/actions/admin-auth"
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client"

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
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-foreground">London Road admin</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} disabled={pending} className="h-11 shrink-0">
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </header>
  )
}
