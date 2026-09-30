// One-off: copies the sample vehicles from lib/mock-data.ts into Firestore so
// they can be edited in the admin. Safe to re-run: vehicles whose slug already
// exists are skipped. Run with:
//   node --experimental-strip-types scripts/seed-mock-vehicles.mjs
import fs from "node:fs"
import { cert, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { mockVehicles } from "../lib/mock-data.ts"

const backslash = String.fromCharCode(92)
const env = {}
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "")
}

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.split(backslash + "n").join("\n"),
  }),
})

const col = getFirestore().collection("vehicles")

for (const { id, ...vehicle } of mockVehicles) {
  const existing = await col.where("slug", "==", vehicle.slug).limit(1).get()
  if (!existing.empty) {
    console.log("skipped (already exists):", vehicle.slug)
    continue
  }
  const ref = await col.add(vehicle)
  console.log("added:", vehicle.slug, "->", ref.id)
}
