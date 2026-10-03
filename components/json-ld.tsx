export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a raw script payload for crawlers.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
