import { ArrowRightIcon, CheckIcon, TriangleAlertIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HeroPhone } from "@/components/home/hero-phone"
import { MoveGlyph } from "@/components/home/move-glyph"
import { PrivacyDiagram } from "@/components/home/privacy-diagram"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/", null, d.meta.description)
}

function Eyebrow({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "hivis" }) {
  return (
    <p className={tone === "hivis" ? "text-sm font-bold text-accent" : "text-sm font-bold text-primary"}>
      <span className="font-mono tracking-wide uppercase">{children}</span>
    </p>
  )
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home

  return (
    <>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-12 pb-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20 md:pb-20">
          <div>
            <Eyebrow>{h.eyebrow}</Eyebrow>
            <h1 className="font-sign mt-4 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">{h.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
            <p className="mt-8 flex max-w-xl items-start gap-2.5 border-l-4 border-signal pl-3 text-sm font-medium">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
              {dict.common.call911}
            </p>
          </div>
          <HeroPhone dict={dict} />
        </div>
      </section>

      {/* The gap */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border-2 border-foreground">
            <Image
              src={PHOTOS.gap.src}
              alt={h.gap.photoAlt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover saturate-[0.85] dark:brightness-90"
              placeholder="blur"
            />
          </div>
          <div>
            <Eyebrow>{h.gap.eyebrow}</Eyebrow>
            <h2 className="font-sign mt-3 text-3xl leading-tight sm:text-4xl">{h.gap.title}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{h.gap.body}</p>
            <dl className="mt-8 divide-y border-y">
              {h.gap.points.map((pt, i) => (
                <div key={pt.k} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className={i === 2 ? "font-bold text-primary" : "font-bold"}>{pt.k}</dt>
                  <dd className="text-muted-foreground">{pt.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Four moves */}
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <Eyebrow>{h.moves.eyebrow}</Eyebrow>
          <h2 className="font-sign mt-3 text-3xl sm:text-4xl">{h.moves.title}</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {h.moves.items.map((item, i) => (
              <li key={item.title} className="flex flex-col rounded-lg border-2 border-foreground bg-card">
                <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3">
                  <span className="grid size-8 place-items-center rounded-sm bg-foreground font-mono text-sm font-semibold text-background">
                    {i + 1}
                  </span>
                  <MoveGlyph index={i} />
                </div>
                <div className="px-4 py-4">
                  <h3 className="font-sign text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href={href(locale, "/how-it-works")}
            className="mt-8 inline-flex min-h-10 items-center gap-2 font-semibold text-primary underline underline-offset-4 hover:decoration-2"
          >
            {h.moves.more}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Accountability: the night band */}
      <section className="border-y bg-band text-band-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:py-24">
          <div>
            <Eyebrow tone="hivis">{h.rules.eyebrow}</Eyebrow>
            <h2 className="font-sign mt-3 text-3xl leading-tight sm:text-4xl">{h.rules.title}</h2>
            <p className="mt-5 text-lg opacity-80">{h.rules.body}</p>
          </div>
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
        </div>
      </section>

      {/* Privacy */}
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl">
            <Eyebrow>{h.privacy.eyebrow}</Eyebrow>
            <h2 className="font-sign mt-3 text-3xl leading-tight sm:text-4xl">{h.privacy.title}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{h.privacy.body}</p>
          </div>
          <div className="mt-10">
            <PrivacyDiagram dict={dict} />
          </div>
        </div>
      </section>

      {/* Responders */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div className="md:order-2">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg border-2 border-foreground">
              <Image
                src={PHOTOS.responder.src}
                alt={h.responder.photoAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover saturate-[0.85] dark:brightness-90"
                placeholder="blur"
              />
            </div>
          </div>
          <div>
            <Eyebrow>{h.responder.eyebrow}</Eyebrow>
            <h2 className="font-sign mt-3 text-3xl leading-tight sm:text-4xl">{h.responder.title}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{h.responder.body}</p>
            <ul className="mt-6 space-y-2.5">
              {h.responder.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" variant="outline" className="mt-8">
              <Link href={href(locale, "/app/respond")}>
                {h.responder.cta}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Communities */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-24">
          <div className="relative aspect-[4/5] max-h-[520px] overflow-hidden rounded-lg border-2 border-foreground">
            <Image
              src={PHOTOS.communities.src}
              alt={h.communities.photoAlt}
              fill
              sizes="(min-width: 768px) 35vw, 100vw"
              className="object-cover saturate-[0.85] dark:brightness-90"
              placeholder="blur"
            />
          </div>
          <div>
            <Eyebrow>{h.communities.eyebrow}</Eyebrow>
            <h2 className="font-sign mt-3 text-3xl leading-tight sm:text-4xl">{h.communities.title}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{h.communities.body}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {h.communities.points.map((pt) => (
                <div key={pt.title} className="rounded-lg border bg-card p-4">
                  <h3 className="font-bold">{pt.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{pt.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:py-24">
          <div>
            <Eyebrow>{h.faq.eyebrow}</Eyebrow>
            <h2 className="font-sign mt-3 text-3xl sm:text-4xl">{h.faq.title}</h2>
          </div>
          <Accordion type="single" collapsible className="border-t">
            {h.faq.items.map((item, i) => (
              <AccordionItem key={item.q} value={`q${i}`} className="border-b">
                <AccordionTrigger className="py-4 text-base font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent className="pb-4 text-base text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-sign text-3xl leading-tight sm:text-4xl">{h.closing.title}</h2>
            <p className="mt-3 text-lg opacity-90">{h.closing.body}</p>
          </div>
          <Button asChild size="lg" variant="hivis" className="shrink-0">
            <Link href={href(locale, "/app")}>
              {h.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
