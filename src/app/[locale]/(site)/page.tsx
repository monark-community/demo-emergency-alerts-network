import { ArrowRightIcon, TriangleAlertIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HeroPhone } from "@/components/home/hero-phone"
import { MoveGlyph } from "@/components/home/move-glyph"
import { PrivacyDiagram } from "@/components/home/privacy-diagram"
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-sm font-bold tracking-wide text-primary uppercase">{children}</p>
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
            <h1 className="font-sign text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">{h.title}</h1>
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

      {/* 1. The gap */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-foreground md:aspect-[4/5]">
            <Image
              src={PHOTOS.gap.src}
              alt={h.gap.photoAlt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover saturate-[0.85] dark:brightness-90"
              placeholder="blur"
            />
          </div>
          <div>
            <Eyebrow>{h.gap.eyebrow}</Eyebrow>
            <h2 className="font-sign mt-3 text-3xl leading-tight sm:text-5xl">{h.gap.title}</h2>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{h.gap.body}</p>
          </div>
        </div>
      </section>

      {/* 2. Three moves */}
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <h2 className="font-sign text-3xl sm:text-4xl">{h.moves.title}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {h.moves.items.map((item, i) => (
              <li key={item.title} className="flex flex-col rounded-lg border-2 border-foreground bg-card">
                <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3">
                  <span className="grid size-8 place-items-center rounded-sm bg-foreground font-mono text-sm font-semibold text-background">
                    {i + 1}
                  </span>
                  <MoveGlyph index={[0, 2, 3][i] ?? i} />
                </div>
                <div className="px-4 py-4">
                  <h3 className="font-sign text-xl">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.body}</p>
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

      {/* 3. Privacy */}
      <section className="border-b bg-band text-band-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl">
            <h2 className="font-sign text-3xl leading-tight sm:text-4xl">{h.privacy.title}</h2>
            <p className="mt-4 text-lg opacity-80">{h.privacy.body}</p>
          </div>
          <div className="mt-10 text-foreground">
            <PrivacyDiagram dict={dict} />
          </div>
        </div>
      </section>

      {/* 4. Responders */}
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
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">{h.responder.body}</p>
            <Button asChild size="lg" variant="outline" className="mt-8">
              <Link href={href(locale, "/app/respond")}>
                {h.responder.cta}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Closing */}
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
