import Link from "next/link"
import { locale as rootLocale } from "next/root-params"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : "en"
}

/** A street sign that points nowhere. */
function DeadEndSign() {
  return (
    <svg viewBox="0 0 120 120" className="size-24" aria-hidden="true">
      <rect x="57" y="40" width="6" height="76" className="fill-muted-foreground" />
      <rect x="10" y="12" width="100" height="40" rx="6" className="fill-primary" />
      <text x="60" y="39" textAnchor="middle" className="fill-primary-foreground font-mono" fontSize="20" fontWeight="600">
        404
      </text>
      <rect x="20" y="104" width="80" height="6" rx="3" className="fill-border" />
    </svg>
  )
}

export default async function NotFound() {
  const locale = await currentLocale()
  const dict = getDictionary(locale)
  const c = dict.common
  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center px-4 py-20 sm:px-6">
          <DeadEndSign />
          <h1 className="font-sign mt-8 text-4xl sm:text-5xl">{c.notFound.title}</h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">{c.notFound.body}</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href={href(locale)}>{c.notFound.home}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href(locale, "/app")}>{c.notFound.demo}</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </>
  )
}
