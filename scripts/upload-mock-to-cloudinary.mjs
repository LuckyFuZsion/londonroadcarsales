/**
 * Upload public/vehicles mock PNGs to Cloudinary, rewrite mock-data.ts, seed Firestore.
 * Usage: node scripts/upload-mock-to-cloudinary.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { v2: cloudinary } = require("cloudinary")
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

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const FOLDER_TO_VEHICLE = {
  "transit-custom": "mock-1",
  golf: "mock-2",
  sprinter: "mock-3",
  corsa: "mock-4",
  ranger: "mock-5",
  qashqai: "mock-6",
}

async function uploadAll() {
  const byVehicle = {}

  for (const [folder, vehicleId] of Object.entries(FOLDER_TO_VEHICLE)) {
    const dir = join(root, "public", "vehicles", folder)
    const files = readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort()

    byVehicle[vehicleId] = []

    for (const file of files) {
      const base = file.replace(/\.[^.]+$/, "")
      const publicId = `vehicles/${vehicleId}/${base}`
      console.log(`Uploading ${folder}/${file} -> ${publicId}`)

      const result = await cloudinary.uploader.upload(join(dir, file), {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: "image",
      })

      byVehicle[vehicleId].push({
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      })
    }
  }

  return byVehicle
}

function imagesLiteral(images) {
  return (
    "images: [\n" +
    images
      .map((img) => `      { publicId: "${img.publicId}", width: ${img.width}, height: ${img.height} },`)
      .join("\n") +
    "\n    ],"
  )
}

function patchMockData(byVehicle) {
  const mockPath = join(root, "lib", "mock-data.ts")
  let source = readFileSync(mockPath, "utf8")

  source = source.replace(
    /\/\*\*[\s\S]*?\*\/\nexport const mockVehicles/,
    `/**
 * Sample stock used when Firebase env vars are absent. Image publicIds are
 * Cloudinary assets under vehicles/{mockId}/.
 */
export const mockVehicles`,
  )

  for (const [folder, vehicleId] of Object.entries(FOLDER_TO_VEHICLE)) {
    const images = byVehicle[vehicleId]
    if (!images?.length) continue
    const pattern = new RegExp(
      String.raw`images:\s*\[[\s\S]*?publicId:\s*"/vehicles/${folder}/[\s\S]*?\],`,
    )
    if (!pattern.test(source)) {
      // Already rewritten: replace cloudinary path block for this vehicle id
      const cloudPattern = new RegExp(
        String.raw`images:\s*\[[\s\S]*?publicId:\s*"vehicles/${vehicleId}/[\s\S]*?\],`,
      )
      if (cloudPattern.test(source)) {
        source = source.replace(cloudPattern, imagesLiteral(images))
      } else {
        console.warn(`No images block matched for ${folder}`)
      }
      continue
    }
    source = source.replace(pattern, imagesLiteral(images))
  }

  writeFileSync(mockPath, source)
  console.log("Updated lib/mock-data.ts")
}

function initFirebase() {
  if (getApps().length) return getFirestore()

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 missing")
  const parsed = JSON.parse(Buffer.from(b64, "base64").toString("utf8"))
  initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: String(parsed.private_key).replace(/\\n/g, "\n"),
    }),
  })
  return getFirestore()
}

async function seedFirestore(byVehicle) {
  // Load patched mock-data by converting TS array export to CJS
  const mockPath = join(root, "lib", "mock-data.ts")
  let src = readFileSync(mockPath, "utf8")
  src = src.replace(/^import[\s\S]*?;\r?\n/, "")
  src = src.replace(/^\/\*[\s\S]*?\*\/\r?\n/, "")
  src = src.replace(/export const mockVehicles: Vehicle\[\] = /, "module.exports = ")
  const tmp = join(root, "scripts", "_mock-temp.cjs")
  writeFileSync(tmp, src)
  const vehicles = require(tmp)

  const db = initFirebase()
  for (const vehicle of vehicles) {
    const images = byVehicle[vehicle.id] ?? vehicle.images
    await db.collection("vehicles").doc(vehicle.id).set(
      { ...vehicle, images, updatedAt: new Date().toISOString() },
      { merge: true },
    )
    console.log(`Seeded Firestore vehicles/${vehicle.id} (${images.length} photos)`)
  }
}

const byVehicle = await uploadAll()
writeFileSync(join(root, "scripts", "cloudinary-mock-map.json"), JSON.stringify(byVehicle, null, 2))
patchMockData(byVehicle)
await seedFirestore(byVehicle)
console.log("Done. Live site will show these once Vercel has NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and redeploys.")
