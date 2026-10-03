import "server-only"
import { Resend } from "resend"
import { business } from "@/lib/business"
import type { EnquiryValues } from "@/lib/validations/enquiry"

const FROM_ADDRESS = "London Road Car Sales <enquiries@londonroadcarsales.uk>"

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && business.email)
}

export async function sendEnquiryEmail(data: EnquiryValues) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.")
  }

  const to = business.email
  if (!to) {
    throw new Error("BUSINESS_EMAIL is not configured.")
  }

  const resend = new Resend(apiKey)
  const subject = data.vehicleTitle
    ? `Enquiry: ${data.vehicleTitle}`
    : "Website enquiry"

  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    data.vehicleTitle ? `Vehicle: ${data.vehicleTitle}` : null,
    data.vehicleSlug ? `Stock link: ${business.siteUrl}/stock/${data.vehicleSlug}` : null,
    "",
    "Message:",
    data.message,
  ].filter((line): line is string => line !== null)

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [to],
    replyTo: data.email,
    subject,
    text: lines.join("\n"),
  })

  if (error) {
    throw new Error(error.message || "Resend rejected the enquiry email.")
  }
}
