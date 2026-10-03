import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { JsonLd } from "@/components/json-ld"
import { business } from "@/lib/business"
import { absoluteUrl, autoDealerJsonLd, canonicalMetadata, siteDescription } from "@/lib/seo"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: `${business.name} | Used Cars & Vans in Grantham`,
    template: `%s | ${business.name}`,
  },
  description: siteDescription(),
  ...canonicalMetadata("/"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: business.name,
    description: business.tagline,
    url: absoluteUrl("/"),
    siteName: business.name,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: business.name }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: business.name,
    description: business.tagline,
    images: ["/og-image.png"],
  },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#2e4b3f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}>
      <body className="antialiased">
        <JsonLd data={autoDealerJsonLd()} />
        {children}
        <Toaster />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
