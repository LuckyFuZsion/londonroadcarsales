import "server-only"
import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

type AdminCredential = {
  projectId: string
  clientEmail: string
  privateKey: string
}

/**
 * Vercel often mangles PEM newlines in FIREBASE_PRIVATE_KEY. Prefer a single
 * base64 service-account JSON instead (FIREBASE_SERVICE_ACCOUNT_BASE64).
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

function fromServiceAccountBase64(): AdminCredential | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim()
  if (!raw) return null

  try {
    const json = Buffer.from(raw, "base64").toString("utf8")
    const parsed = JSON.parse(json) as {
      project_id?: string
      client_email?: string
      private_key?: string
    }

    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      console.error("FIREBASE_SERVICE_ACCOUNT_BASE64 is missing project_id, client_email or private_key.")
      return null
    }

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    }
  } catch (error) {
    console.error("Failed to decode FIREBASE_SERVICE_ACCOUNT_BASE64:", error)
    return null
  }
}

function fromSplitEnvVars(): AdminCredential | null {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) return null

  return { projectId, clientEmail, privateKey: normalizePrivateKey(privateKey) }
}

/**
 * Firebase Admin is only initialised when credentials are present. Until then
 * `isFirebaseAdminConfigured()` returns false and public reads fall back to
 * mock data locally (or empty stock in production).
 */
function getRequiredEnv(): AdminCredential | null {
  return fromServiceAccountBase64() ?? fromSplitEnvVars()
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
 * Used by admin writes / enquiries. Public pages soft-fail instead so a
 * missing credential does not white-screen the whole site.
 */
export function assertFirebaseConfiguredInProduction() {
  if (isProductionRuntime() && !isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured in production. Set FIREBASE_SERVICE_ACCOUNT_BASE64 (preferred) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.",
    )
  }
}

let app: App | null = null

function getAdminApp(): App {
  const env = getRequiredEnv()
  if (!env) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 (preferred) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.",
    )
  }

  if (app) return app

  const existing = getApps()[0]
  if (existing) {
    app = existing
    return app
  }

  const serviceAccount: ServiceAccount = {
    projectId: env.projectId,
    clientEmail: env.clientEmail,
    privateKey: env.privateKey,
  }

  try {
    app = initializeApp({
      credential: cert(serviceAccount),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown credential error"
    throw new Error(
      `Firebase Admin credential failed (${message}). Prefer FIREBASE_SERVICE_ACCOUNT_BASE64 (base64 of the service account JSON) on Vercel.`,
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
