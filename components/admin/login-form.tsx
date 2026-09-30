"use client"

import { useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAdminSession } from "@/app/actions/admin-auth"
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client"

export function LoginForm() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")

    try {
      if (!isFirebaseClientConfigured()) {
        setError("Sign-in is not configured yet.")
        return
      }

      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
      const idToken = await credential.user.getIdToken()
      const result = await createAdminSession(idToken)

      if (!result.ok) {
        setError(result.error ?? "Sign-in failed. Please try again.")
        return
      }

      window.location.assign("/admin")
    } catch {
      setError("Incorrect email or password.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" className="mt-1.5 h-11" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 h-11"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} className="h-11 w-full">
        {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Sign in
      </Button>
    </form>
  )
}
