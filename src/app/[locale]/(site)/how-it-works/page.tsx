import { ArrowDownIcon, ArrowRightIcon, CornerDownRightIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const h = getDictionary(locale).how
  return pageMetadata(locale, "/how-it-works", h.metaTitle, h.metaDescription)
}

function Section({ title, body, children, className }: { title: string; body?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("border-b", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="font-sign text-2xl sm:text-3xl">{title}</h2>
        {body ? <p className="mt-3 max-w-2xl text-lg opacity-80">{body}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const h = getDictionary(locale).how
  const s = h.lifecycle.states
  const main = [
    [s.raised, s.raisedBody],
    [s.notified, s.notifiedBody],
    [s.accepted, s.acceptedBody],
    [s.checkedIn, s.checkedInBody],
    [s.settled, s.settledBody],
  ] as const

  return (
    <>
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 sm:px-6 md:pt-20">
          <p className="font-mono text-sm font-bold tracking-wide text-primary uppercase">{h.eyebrow}</p>
          <h1 className="font-sign mt-3 text-4xl sm:text-6xl">{h.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
        </div>
      </section>

      <Section title={h.lifecycle.title} body={h.lifecycle.body}>
        <div role="img" aria-label={h.lifecycle.label}>
          <ol className="grid gap-2 md:grid-cols-5 md:gap-0">
            {main.map(([name, body], i) => (
              <li key={name} className="flex flex-col md:flex-row md:items-stretch">
                <div className={cn("flex-1 rounded-lg border-2 border-foreground p-4", i === main.length - 1 ? "bg-primary text-primary-foreground" : "bg-card")}>
                  <p className="font-mono text-xs opacity-70">0{i + 1}</p>
                  <p className="font-sign mt-1 text-lg">{name}</p>
                  <p className="mt-1 text-sm opacity-80">{body}</p>
                </div>
                {i < main.length - 1 ? (
                  <span className="grid place-items-center py-1 md:px-1 md:py-0" aria-hidden="true">
                    <ArrowDownIcon className="size-5 md:hidden" />
                    <ArrowRightIcon className="hidden size-5 md:block" />
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:w-3/5">
            {[
              [s.cancelled, s.cancelledBody],
              [s.flagged, s.flaggedBody],
            ].map(([name, body]) => (
              <div key={name} className="flex items-start gap-3 rounded-lg border-2 border-dashed border-signal p-4">
                <CornerDownRightIcon className="mt-1 size-5 shrink-0 text-signal" aria-hidden="true" />
                <div>
                  <p className="font-sign text-lg">{name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title={h.rules.title} body={h.rules.body} className="bg-band text-band-foreground">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-band-foreground/60 font-mono text-xs tracking-wide uppercase">
              <th scope="col" className="py-2 pr-4 font-semibold">
                {h.rules.colWhen}
              </th>
              <th scope="col" className="py-2 font-semibold">
                {h.rules.colThen}
              </th>
            </tr>
          </thead>
          <tbody>
            {h.rules.rows.map((row) => (
              <tr key={row.when} className="border-b border-band-foreground/25 align-top">
                <th scope="row" className="w-[45%] py-4 pr-4 font-semibold">
                  {row.when}
                </th>
                <td className="py-4 opacity-85">{row.then}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={h.money.title} body={h.money.body}>
        <div className="grid gap-3 sm:grid-cols-3">
          {h.money.radii.map((row) => (
            <div key={row.r} className="rounded-lg border-2 border-foreground bg-card p-4">
              <p className="font-mono text-sm text-muted-foreground">{row.r}</p>
              <p className="font-sign mt-1 text-2xl sm:text-3xl">{row.d}</p>
              <p className="mt-1 text-sm text-muted-foreground">{row.reach}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-muted-foreground">{h.money.allowance}</p>
      </Section>

      <Section title={h.privacy.title}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-foreground font-mono text-xs tracking-wide uppercase">
              <th scope="col" className="py-2 pr-4 font-semibold">
                {h.privacy.whoCol}
              </th>
              <th scope="col" className="py-2 font-semibold">
                {h.privacy.seesCol}
              </th>
            </tr>
          </thead>
          <tbody>
            {h.privacy.rows.map((row) => (
              <tr key={row.who} className="border-b align-top">
                <th scope="row" className="w-2/5 py-4 pr-4 font-semibold">
                  {row.who}
                </th>
                <td className="py-4 text-muted-foreground">{row.sees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={h.reputation.title} body={h.reputation.body}>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {h.reputation.tiers.map((tier, i) => (
            <li key={tier.name} className={cn("rounded-lg border-2 p-4", i === 2 ? "border-foreground bg-accent text-accent-foreground" : "border-foreground bg-card")}>
              <p className="flex items-baseline justify-between">
                <span className="font-sign text-lg">{tier.name}</span>
                <span className="font-mono text-xs">{tier.range}</span>
              </p>
              <p className="mt-1 text-sm">{tier.unlock}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {h.reputation.changes.map((c) => (
            <li key={c.v} className="flex items-baseline gap-3">
              <span className={cn("w-10 shrink-0 font-mono font-semibold", c.k.startsWith("+") ? "text-primary" : "text-signal")}>{c.k}</span>
              <span className="text-muted-foreground">{c.v}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={h.faq.title}>
        <Accordion type="single" collapsible className="max-w-3xl border-t">
          {h.faq.items.map((item, i) => (
            <AccordionItem key={item.q} value={`q${i}`} className="border-b">
              <AccordionTrigger className="py-4 text-base font-semibold">{item.q}</AccordionTrigger>
              <AccordionContent className="pb-4 text-base text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <Button asChild size="lg">
            <Link href={href(locale, "/app")}>
              {h.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
