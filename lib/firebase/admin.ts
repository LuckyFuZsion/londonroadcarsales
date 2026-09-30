import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

/**
 * Firebase Admin is only initialised when all required server env vars are
 * present. Until then `isFirebaseAdminConfigured()` returns false and every
 * data-access helper in lib/vehicles.ts falls back to the local mock data,
 * so the site remains fully previewable before Firebase is connected.
 */
function getRequiredEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) return null

  return { projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }
}

export function isFirebaseAdminConfigured() {
  return getRequiredEnv() !== null
}

/**
 * Mock stock and dropped enquiries are for local development only. In
 * production a missing Firebase config is a deployment error, so fail loudly
 * rather than silently showing fake vehicles. `next build` is exempt so the
 * build can run without live credentials.
 */
export function assertFirebaseConfiguredInProduction() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build" &&
    !isFirebaseAdminConfigured()
  ) {
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

  app = initializeApp({
    credential: cert(env),
  })

  return app
}

export function adminDb() {
  return getFirestore(getAdminApp())
}

export function adminAuth() {
  return getAuth(getAdminApp())
}
