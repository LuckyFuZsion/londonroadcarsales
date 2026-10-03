/**
 * Single source of truth for London Road Car Sales business details.
 * Used across the header, footer, contact page and structured data.
 *
 * TODO: replace placeholder values (marked below) with real client-supplied
 * details before launch.
 */

export const business = {
  name: "London Road Car Sales",
  legalName: "[Company name] Ltd", // TODO: confirm legal trading name
  tagline: "Affordable Vans, Cars and Commercial Vehicles",
  domain: "londonroadcarsales.uk",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://londonroadcarsales.uk",

  address: {
    line1: "26 London Road",
    town: "Grantham",
    county: "Lincolnshire",
    postcode: "NG31 6EJ",
    country: "GB",
  },

  // TODO: approximate coordinates for London Road, Grantham - confirm exact pin with client.
  geo: {
    latitude: 52.9126,
    longitude: -0.6396,
  },

  phone: {
    display: "07395 827975",
    href: "tel:+447395827975",
  },

  whatsapp: {
    number: "447395827975",
    href: "https://wa.me/447395827975",
  },

  email: process.env.BUSINESS_EMAIL ?? "tywebster@hotmail.co.uk",

  hours: [
    { day: "Monday", open: "09:00", close: "18:00" },
    { day: "Tuesday", open: "09:00", close: "18:00" },
    { day: "Wednesday", open: "09:00", close: "18:00" },
    { day: "Thursday", open: "09:00", close: "18:00" },
    { day: "Friday", open: "09:00", close: "18:00" },
    { day: "Saturday", open: "10:00", close: "17:00" },
    { day: "Sunday", open: null, close: null },
  ],

  usps: [
    "12 months MOT with every vehicle",
    "Full service with every vehicle",
    "Comprehensive in-house warranty",
    "Independent finance available",
  ],

  // TODO: confirm registration details with the client (Ltd company or sole trader).
  legal: {
    companyNumber: "[X]", // TODO
    vatNumber: "[X]", // TODO
    icoRegistrationNumber: "[X]", // TODO
  },

  credit: {
    label: "Website by WebFuZsion Web Design",
    href: "https://webfuzsion.co.uk",
  },
} as const

export function formattedAddress() {
  const { line1, town, county, postcode } = business.address
  return `${line1}, ${town}, ${county}, ${postcode}`
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number)
  const suffix = h >= 12 ? "pm" : "am"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return m ? `${hour12}:${String(m).padStart(2, "0")}${suffix}` : `${hour12}${suffix}`
}

/** Short opening hours line built from `business.hours`, e.g. "Mon-Fri 9am-6pm, Sat 10am-5pm, Sun closed". */
export function hoursSummary() {
  const [mon, , , , , sat, sun] = business.hours
  const weekdaysMatch = business.hours.slice(0, 5).every((h) => h.open === mon.open && h.close === mon.close)
  const range = (h: { open: string | null; close: string | null }) =>
    h.open && h.close ? `${formatTime(h.open)}-${formatTime(h.close)}` : "closed"
  const parts = weekdaysMatch
    ? [`Mon-Fri ${range(mon)}`]
    : business.hours.slice(0, 5).map((h) => `${h.day.slice(0, 3)} ${range(h)}`)
  parts.push(`Sat ${range(sat)}`, `Sun ${range(sun)}`)
  return parts.join(", ")
}
