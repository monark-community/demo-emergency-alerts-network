import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

// Internal strategy review only: never linked, not in the sitemap, not indexed.
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const p = getDictionary(locale).pricing
  return { title: p.metaTitle, robots: { index: false, follow: false } }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const p = getDictionary(locale).pricing
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <p className="font-mono text-sm font-bold tracking-wide text-primary uppercase">{p.eyebrow}</p>
      <h1 className="font-sign mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">{p.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{p.sub}</p>
      <ol className="mt-12 grid gap-4 lg:grid-cols-3">
        {p.plans.map((plan, i) => (
          <li
            key={plan.name}
            className={cn("flex flex-col rounded-lg border-2 border-foreground", i === 2 ? "bg-band text-band-foreground" : "bg-card")}
          >
            <div className="border-b-2 border-current/80 p-5">
              <p className="font-sign text-xl">{plan.name}</p>
              <p className="mt-1 text-sm opacity-75">{plan.who}</p>
              <p className="mt-5 font-mono text-4xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-sm opacity-75">{plan.unit}</p>
            </div>
            <ul className="space-y-2 p-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon className={cn("mt-0.5 size-4 shrink-0", i === 2 ? "text-accent" : "text-primary")} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-sign text-2xl">{p.reasoning.title}</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {p.reasoning.items.map((item) => (
              <li key={item} className="border-l-4 border-accent pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4 self-start rounded-lg border-2 border-dashed p-5">
          <p className="font-semibold">{p.never}</p>
          <p className="text-sm text-muted-foreground">{p.note}</p>
        </div>
      </div>
    </section>
  )
}
