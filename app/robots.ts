import type { MetadataRoute } from "next"
import { business } from "@/lib/business"

const disallow = ["/admin", "/api"]

/** Explicit AI crawler agents so GEO tools and assistants see Allow rules. */
const aiUserAgents = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      ...aiUserAgents.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow,
      })),
    ],
    sitemap: `${business.siteUrl}/sitemap.xml`,
  }
}
