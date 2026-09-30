import { z } from "zod"

export const vehicleImageSchema = z.object({
  publicId: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export const vehicleFormSchema = z.object({
  status: z.enum(["draft", "available", "reserved", "sold"]),
  vehicleType: z.enum(["car", "van", "commercial"]),
  reg: z.string().trim().min(1, "Registration is required"),
  make: z.string().trim().min(1, "Make is required"),
  model: z.string().trim().min(1, "Model is required"),
  variant: z.string().trim().default(""),
  year: z.coerce.number().int().min(1970).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0),
  vatStatus: z.enum(["inc", "ex", "none"]).nullable(),
  fuel: z.string().trim().min(1, "Fuel type is required"),
  transmission: z.string().trim().min(1, "Transmission is required"),
  bodyType: z.string().trim().min(1, "Body type is required"),
  colour: z.string().trim().min(1, "Colour is required"),
  doors: z.coerce.number().int().min(0).nullable(),
  seats: z.coerce.number().int().min(0).nullable(),
  engineSize: z.string().trim().default(""),
  owners: z.coerce.number().int().min(0).nullable(),
  motExpiry: z.string().nullable(),
  description: z.string().trim().default(""),
  features: z.array(z.string().trim().min(1)).default([]),
  images: z.array(vehicleImageSchema).default([]),
})

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>
