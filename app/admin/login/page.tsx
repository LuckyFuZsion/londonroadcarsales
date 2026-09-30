import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/auth"
import { LoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin")

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">London Road Car Sales stock management.</p>
        <LoginForm />
      </div>
    </main>
  )
}
