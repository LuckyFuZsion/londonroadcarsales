/**
 * Seed Firestore with mock vehicles that already have Cloudinary publicIds.
 * Usage: node scripts/seed-mock-firestore.mjs
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { cert, getApps, initializeApp } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function loadEnvLocal() {
  const raw = readFileSync(join(root, ".env.local"), "utf8")
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    value = value.replace(/\\n/g, "\n")
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const mockPath = join(root, "lib", "mock-data.ts")
let src = readFileSync(mockPath, "utf8")
src = src.replace(/import type \{ Vehicle \} from "@\/lib\/types"\r?\n\r?\n/, "")
src = src.replace(/\/\*\*[\s\S]*?\*\/\r?\n/, "")
src = src.replace(/export const mockVehicles: Vehicle\[\] = /, "module.exports = ")
const tmp = join(root, "scripts", "_mock-temp.cjs")
writeFileSync(tmp, src)
const vehicles = require(tmp)

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 missing")
const parsed = JSON.parse(Buffer.from(b64, "base64").toString("utf8"))

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: String(parsed.private_key).replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()
for (const vehicle of vehicles) {
  await db.collection("vehicles").doc(vehicle.id).set(
    { ...vehicle, updatedAt: new Date().toISOString() },
    { merge: true },
  )
  console.log(`Seeded vehicles/${vehicle.id} (${vehicle.images.length} Cloudinary images)`)
}
console.log("Done.")
