import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/auth"
import { AdminHeader } from "@/components/admin/admin-header"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage()

  return (
    <div className="min-h-dvh bg-background">
      <AdminHeader email={session.email} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
