import Link from "next/link"
import { business } from "@/lib/business"

const faqs = [
  {
    question: "What do you include with every used vehicle?",
    answer:
      "Every car, van and commercial vehicle from London Road Car Sales comes with 12 months MOT, a full service and our comprehensive in-house warranty, all included in the advertised price. Independent finance can also be arranged through a separate facility, subject to status.",
  },
  {
    question: "Why buy a used car or van from a Grantham dealer?",
    answer:
      "We are a family-run forecourt on London Road, so you can view stock in person, ask straight questions and deal with the same people after the sale. We serve Grantham and the wider Lincolnshire area with honestly presented vehicles at clear prices.",
  },
  {
    question: "How do I check a vehicle or arrange a visit?",
    answer:
      "Browse our current stock online, then call or message us to reserve a viewing. You can also check a vehicle's MOT history on the official GOV.UK service before you buy. No appointment is needed during opening hours if you prefer to drop in.",
  },
] as const

export function HomeFaq() {
  return (
    <section className="border-t border-border bg-card" aria-labelledby="home-faq-heading">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 id="home-faq-heading" className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Common questions
        </h2>
        <p className="speakable-summary mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Buying a used car or van should feel simple. Here are clear answers about what we include, why local
          buyers choose us, and how to arrange a visit in Grantham.
        </p>

        <div className="mt-8 space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-heading text-lg font-semibold text-foreground">{faq.question}</h3>
              {faq.question.startsWith("How do I") ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Browse our{" "}
                  <Link href="/stock" className="font-medium text-primary underline-offset-4 hover:underline">
                    current stock
                  </Link>
                  , then call or message us to reserve a viewing. You can also{" "}
                  <a
                    href="https://www.gov.uk/check-mot-history"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    check MOT history on GOV.UK
                  </a>{" "}
                  before you buy. No appointment is needed during opening hours if you prefer to drop in.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Still unsure? Call{" "}
          <a href={business.phone.href} className="font-semibold text-primary">
            {business.phone.display}
          </a>{" "}
          or visit our{" "}
          <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

export function homeFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}
