import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { isCloudinaryConfigured, isValidVehicleId, signVehicleUpload } from "@/lib/cloudinary-server"
import { getVehicleByIdAdmin } from "@/lib/vehicles"

export const dynamic = "force-dynamic"

/**
 * Admin only. Returns a signed parameter set so the browser can upload a
 * photo straight to Cloudinary (images never pass through Next.js).
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const vehicleId = body?.vehicleId

  if (!isValidVehicleId(vehicleId) || !(await getVehicleByIdAdmin(vehicleId))) {
    return NextResponse.json({ error: "Unknown vehicle." }, { status: 400 })
  }

  return NextResponse.json(signVehicleUpload(vehicleId), { headers: { "Cache-Control": "no-store" } })
}
