import Link from "next/link"

import { Button } from "@/components/ui/button"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { GuardianWordmark } from "./brand"
import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme"

export function navItems(locale: Locale, dict: Dictionary): NavItem[] {
  return [
    { href: href(locale, "/how-it-works"), label: dict.common.nav.how },
    { href: href(locale, "/app"), label: dict.common.nav.demo, prefix: true },
  ]
}

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const items = navItems(locale, dict)
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href={href(locale)} aria-label={c.brandHome} className="rounded-sm">
          <GuardianWordmark />
        </Link>
        <nav aria-label={c.nav.label} className="hidden md:block">
          <NavLinks items={items} className="flex items-center gap-1" />
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LocaleSwitch locale={locale} label={c.language} names={c.names} short={c.short} />
          <ThemeToggle label={c.theme} />
          <Button asChild className="ml-1">
            <Link href={href(locale, "/app")}>{c.openDemo}</Link>
          </Button>
        </div>
        <div className="ml-auto md:hidden">
          <MobileMenu
            locale={locale}
            items={[{ href: href(locale), label: c.nav.home }, ...items]}
            appHref={href(locale, "/app")}
            labels={{
              open: c.menuOpen,
              close: c.menuClose,
              nav: c.nav.label,
              tagline: c.footer.tagline,
              cta: c.openDemo,
              theme: c.theme,
              language: c.language,
              names: c.names,
              short: c.short,
            }}
          />
        </div>
      </div>
    </header>
  )
}
