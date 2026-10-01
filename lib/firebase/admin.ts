import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

/**
 * Vercel and .env files often wrap the PEM in quotes and/or store newlines as
 * the two-character sequence \n. Normalise both before handing to firebase-admin.
 */
function normalizePrivateKey(privateKey: string) {
  let key = privateKey.trim()

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1)
  }

  return key.replace(/\\n/g, "\n")
}

/**
 * Firebase Admin is only initialised when all required server env vars are
 * present. Until then `isFirebaseAdminConfigured()` returns false and every
 * data-access helper in lib/vehicles.ts falls back to the local mock data,
 * so the site remains fully previewable before Firebase is connected.
 */
function getRequiredEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) return null

  return { projectId, clientEmail, privateKey: normalizePrivateKey(privateKey) }
}

export function isFirebaseAdminConfigured() {
  return getRequiredEnv() !== null
}

function isProductionRuntime() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  )
}

/**
 * Mock stock and dropped enquiries are for local development only. In
 * production a missing Firebase config is a deployment error, so fail loudly
 * rather than silently showing fake vehicles. `next build` is exempt so the
 * build can run without live credentials.
 */
export function assertFirebaseConfiguredInProduction() {
  if (isProductionRuntime() && !isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured in production. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    )
  }
}

let app: App | null = null

function getAdminApp(): App {
  const env = getRequiredEnv()
  if (!env) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    )
  }

  if (app) return app

  const existing = getApps()[0]
  if (existing) {
    app = existing
    return app
  }

  try {
    app = initializeApp({
      credential: cert(env),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown credential error"
    throw new Error(
      `Firebase Admin credential failed (${message}). On Vercel, set FIREBASE_PRIVATE_KEY as one line with \\n for newlines, without wrapping quotes.`,
    )
  }

  return app
}

export function adminDb() {
  return getFirestore(getAdminApp())
}

export function adminAuth() {
  return getAuth(getAdminApp())
}
