import Link from "next/link"

import { href, MONARK_URL, PROJECT_DOC_URL, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { GuardianWordmark } from "./brand"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const year = new Date().getFullYear()
  const links = [
    { href: href(locale), label: c.nav.home },
    { href: href(locale, "/how-it-works"), label: c.nav.how },
    { href: href(locale, "/app"), label: c.nav.demo },
    { href: href(locale, "/credits"), label: c.nav.credits },
  ]
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr]">
        <div className="max-w-sm">
          <GuardianWordmark />
          <p className="mt-4 text-sm text-muted-foreground">{c.footer.tagline}</p>
        </div>
        <nav aria-label={c.footer.linksLabel}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={PROJECT_DOC_URL} className="inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground">
                {c.footer.projectDoc}
              </a>
            </li>
            <li>
              <a href={REPO_URL} className="inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground">
                {c.footer.repo}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground">
              {c.demoBadge}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              © {year} {c.footer.rights}
            </span>
            <Link href={href(locale, "/credits")} className="hover:text-foreground">
              {c.footer.photos}
            </Link>
            <a href={MONARK_URL} className="text-[0.8125rem] hover:text-foreground">
              {c.footer.builtWith}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
