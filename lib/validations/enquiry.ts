import { z } from "zod"

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional().default(""),
  message: z.string().trim().min(1, "Please enter a message"),
  vehicleSlug: z.string().optional().default(""),
  vehicleTitle: z.string().optional().default(""),
  // Honeypot field - real users never fill this in.
  company: z.string().max(0).optional().default(""),
})

export type EnquiryValues = z.infer<typeof enquirySchema>
