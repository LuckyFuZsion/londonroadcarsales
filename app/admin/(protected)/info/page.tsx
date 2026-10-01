import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Information",
  robots: { index: false, follow: false },
}

const accounts = [
  {
    service: "Resend (enquiry emails)",
    detail: "londonroadcarsales@webfuzsion.co.uk",
    note: "The email address the Resend account is registered with. Use it to sign in to resend.com or reset the password.",
  },
]

export default function AdminInfoPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Information</h1>
      <p className="mt-1 text-sm text-muted-foreground">Account details for the services behind the website. Only signed-in admins can see this page.</p>

      <ul className="mt-5 space-y-3">
        {accounts.map((account) => (
          <li key={account.service} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{account.service}</p>
            <p className="mt-1 break-all font-semibold text-foreground">{account.detail}</p>
            <p className="mt-1 text-sm text-muted-foreground">{account.note}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
