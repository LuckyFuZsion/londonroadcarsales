import { z } from "zod"

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long")
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .min(1, "Please enter a message")
    .max(2000, "Message is too long"),
  vehicleSlug: z.string().trim().max(200).optional().default(""),
  vehicleTitle: z.string().trim().max(200).optional().default(""),
  /** Honeypot fields - must stay empty. */
  company: z.string().max(0).optional().default(""),
  websiteUrl: z.string().max(0).optional().default(""),
  /** Epoch ms when the form was shown. Used to reject instant bot posts. */
  formStartedAt: z.string().optional().default(""),
})

export type EnquiryValues = z.infer<typeof enquirySchema>

/** Minimum time a real visitor needs before submit (ms). */
export const ENQUIRY_MIN_FILL_MS = 2500
